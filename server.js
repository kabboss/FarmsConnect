// Importer les dépendances
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');


// Modèles
const User = require('./models/User');
const Message = require('./models/message');
const Annonce = require('./models/Annonce'); // Assurez-vous que le chemin du modèle est correct

// Créer une instance de l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware pour augmenter la limite de taille des requêtes JSON
app.use(express.json({ limit: '20mb' })); // Vous pouvez ajuster cette valeur

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());
app.use(bodyParser.json());

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Middleware CORS
app.use(cors({
    origin: 'https://farmsconnect-b084ddb02391.herokuapp.com', // ou '*' pour autoriser toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Connexion à MongoDB
mongoose.connect('mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority', {})
    .then(() => console.log('Connecté à MongoDB...'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kaboreabwa2020@gmail.com',
        pass: 'swbo vejr klic otpu' // Remplacez par votre mot de passe ou mot de passe d'application
    }
});


// Routes

// Route pour s'inscrire (signup)
app.post('/api/signup', async (req, res) => {
    const { username, email, contact, password, userType } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Cet utilisateur existe déjà.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, contact, password: hashedPassword, userType });
        await newUser.save();
        res.status(201).send('Utilisateur créé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l’inscription :', error);
        res.status(500).send('Erreur lors de l’inscription : ' + error.message);
    }
});

// Route pour se connecter (login)
app.post('/api/login', async (req, res) => {
    const { username, email, contact, password } = req.body;
    try {
        if (!username || !email || !contact || !password) {
            return res.status(400).send('Veuillez fournir le nom d’utilisateur, l\'email, le contact et le mot de passe.');
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Nom d’utilisateur incorrect.');
        }
        if (user.email !== email || user.contact !== contact) {
            return res.status(400).send('Email ou contact incorrect.');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Mot de passe incorrect.');
        }
        const token = jwt.sign({ userId: user._id }, 'ka23bo23re23'); // Remplacez par une vraie clé secrète
        res.status(200).json({ username: user.username, email: user.email, contact: user.contact, token, message: 'Connexion réussie !' });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).send('Erreur lors de la connexion : ' + error.message);
    }
});

// Route pour passer une commande et envoyer l'email
app.post('/api/order', async (req, res) => {
    console.log('Données reçues :', req.body);
    const { username, email, contact, price, quantity, weight, Produit: nomproduit } = req.body;

    if (!username || !nomproduit || !email || !contact || !price || !quantity || !weight) {
        console.error('Informations manquantes dans la requête :', req.body);
        return res.status(400).send('Veuillez fournir toutes les informations nécessaires : username, nom du produit, email, contact, prix, quantité et poids.');
    }

    try {
        const mailOptions = {
            from: 'kaboreabwa2020@gmail.com',
            to: email,
            subject: 'Confirmation de commande',
            text: `Merci, ${username}, pour votre commande !\n\nVoici les détails :\n- Produit : ${nomproduit}\n- Prix total : ${price} FCFA\n- Quantité : ${quantity}\n- Poids total : ${weight} kg\n\nNous vous contacterons au numéro ${contact} pour valider la commande.\n\nNB : Les animaux subiront un contrôle de santé avec l'un de nos vétérinaires, et vous serez livré dans un délai de 24 heures maximum. Le paiement se fera à la livraison.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
                return res.status(500).send('Erreur lors de l\'envoi de l\'e-mail : ' + error.message);
            }
            console.log('E-mail envoyé : ' + info.response);
            res.status(200).send('Commande passée avec succès et e-mail envoyé !');
        });
    } catch (error) {
        console.error('Erreur lors du traitement de la commande :', error);
        res.status(500).send('Erreur lors du traitement de la commande : ' + error.message);
    }
});

// Route pour servir le fichier users.html
app.get('/users', (req, res) => {
    res.sendFile(__dirname + '/public/users.html');
});

// Route pour servir le fichier Visiteur.html
app.get('/Visiteur', (req, res) => {
    res.sendFile(__dirname + '/public/Visiteur.html');
});

// Route pour récupérer les informations de l'utilisateur
app.post('/api/getUserInfo', async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findById(userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des informations de l\'utilisateur.' });
    }
});

// Route pour envoyer les informations d'achat par email
app.post('/api/send-email', async (req, res) => {
    const { content } = req.body;
    const mailOptions = {
        from: 'kaboreabwa2020@gmail.com',
        to: 'kaboreabwa2020@gmail.com',
        subject: 'Nouvelle commande reçue',
        text: content
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
            return res.status(500).send('Erreur lors de l\'envoi de l\'e-mail.');
        }
        console.log('E-mail envoyé :', info.response);
        res.status(200).send('E-mail envoyé avec succès.');
    });
});

// Route pour ajouter une annonce
app.post('/api/annonces', async (req, res) => {
    try {
        const annonce = new Annonce(req.body);
        await annonce.save(); // Sauvegarde l'annonce dans MongoDB
        res.status(201).json({ message: 'Annonce ajoutée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'annonce' });
    }
});

// Route pour récupérer toutes les annonces
app.get('/api/annonces', async (req, res) => {
    try {
        const annonces = await Annonce.find(); // Récupère toutes les annonces depuis MongoDB
        res.json(annonces);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du chargement des annonces' });
    }
});



// Routes pour les messages
app.get('/api/messages', (req, res) => {
    Message.find()
        .then(messages => res.json(messages))
        .catch(err => res.status(400).json(err));
});

app.post('/api/messages', (req, res) => {
    const { username, content } = req.body;
    const newMessage = new Message({ username, content });
    newMessage.save()
        .then(message => {
            res.status(201).json(message);
            // Émettre l'événement pour les nouveaux messages
            io.emit('newMessage', message);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});


app.put('/api/messages/:id', (req, res) => {
    const { content } = req.body;
    Message.findByIdAndUpdate(req.params.id, { content }, { new: true })
        .then(updatedMessage => res.json(updatedMessage))
        .catch(err => res.status(400).json(err));
});

app.delete('/api/messages/:id', (req, res) => {
    Message.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(400).json(err));
});

// Routes pour les réponses
app.post('/api/messages/:id/replies', (req, res) => {
    const { username, content } = req.body;
    const reply = { username, content };
    Message.findByIdAndUpdate(req.params.id, { $push: { replies: reply } }, { new: true })
        .then(updatedMessage => {
            io.emit('newMessage', updatedMessage);
            res.json(updatedMessage);
        })
        .catch(err => res.status(400).json(err));
});

// Routes pour les utilisateurs
app.post('/api/users', (req, res) => {
    const { username, email, contact } = req.body;
    const newUser = new User({ username, email, contact });
    newUser.save()
        .then(savedUser => res.json(savedUser))
        .catch(err => res.status(400).json(err));
});





//Formation



// Configuration des middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration de Multer pour l'upload des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Modèles de base de données
const Content = require('./models/content');
const Comment = require('./models/comment');

// Middleware pour vérifier le code de sécurité
const verifySecurityCode = (req, res, next) => {
    const { securityCode } = req.body;
    if (securityCode !== "ka23bo23re23") {
        return res.status(403).json({ message: 'Code de sécurité invalide' });
    }
    next();
};

// Routes pour le contenu

// Route pour uploader un contenu (seul l'administrateur avec le bon code de sécurité peut le faire)
app.post('/api/content/upload', verifySecurityCode, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, level, type } = req.body;
        const content = new Content({
            title,
            description,
            category,
            level,
            type,
            filePath: `/uploads/${req.file.filename}`,
            uploadedBy: 'admin'
        });
        
        await content.save();
        const io = req.app.get('io'); // Récupérer `io` via `app`
        io.emit('new-content', content); // Notification aux utilisateurs

        res.json(content);
    } catch (error) {
        console.error('Erreur lors de l\'upload du contenu :', error); // Journalisation de l'erreur
        res.status(500).json({ message: 'Erreur lors de l\'upload du contenu' });
    }
});

// Route pour obtenir tous les contenus
app.get('/api/content/all', async (req, res) => {
    try {
        const contents = await Content.find({});
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des contenus' });
    }
});

// Route pour liker un contenu
app.patch('/api/content/like/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Contenu non trouvé' });
        }
        
        content.likes += 1;
        await content.save();
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du like du contenu' });
    }
});

// Routes pour les commentaires

// Route pour ajouter un commentaire
app.post('/api/comments/add', async (req, res) => {
    try {
        const { contentId, user, text } = req.body;
        const comment = new Comment({ contentId, user, text });
        
        await comment.save();
        io.emit('new-comment', comment); // Envoie une notification aux utilisateurs
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
    }
});

// Route pour obtenir les commentaires d'un contenu spécifique
app.get('/api/comments/:contentId', async (req, res) => {
    try {
        const comments = await Comment.find({ contentId: req.params.contentId });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
});

// Route pour liker un commentaire
app.patch('/api/comments/like/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        
        comment.likes += 1;
        await comment.save();
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du like du commentaire' });
    }
});

// Gestion des notifications avec Socket.IO

io.on('connection', (socket) => {
    console.log('Nouvelle connexion client');

    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});














// Configuration du serveur
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

// WebSocket pour les communications en temps réel
io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté');
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

