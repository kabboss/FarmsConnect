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
const fs = require('fs');

// Modèles
const User = require('./models/User');
const message = require('./models/message');
const Annonce = require('./models/Annonce');

// Créer une instance de l'application Express et du serveur HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware pour gérer les fichiers JSON et statiques
app.use(express.json({ limit: '20mb' }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuration CORS pour permettre les requêtes provenant de l'origine spécifiée
app.use(cors({
    origin: 'https://farmsconnect-b084ddb02391.herokuapp.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Connexion à MongoDB
const mongoURI = 'mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connecté à MongoDB...'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kaboreabwa2020@gmail.com',
        pass: 'swbo vejr klic otpu'
    }
});

// Code d'accès admin pour les téléversements de vidéos
const adminCode = "ka23bo23re23";

// Routes d'authentification

// Route pour l'inscription
app.post('/api/signup', async (req, res) => {
    const { username, email, contact, password, userType } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).send('Cet utilisateur existe déjà.');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, contact, password: hashedPassword, userType });
        await newUser.save();
        
        res.status(201).send('Utilisateur créé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l’inscription :', error);
        res.status(500).send('Erreur lors de l’inscription : ' + error.message);
    }
});

// Route pour la connexion
app.post('/api/login', async (req, res) => {
    const { username, email, contact, password } = req.body;
    try {
        if (!username || !email || !contact || !password) return res.status(400).send('Veuillez fournir tous les champs.');
        
        const user = await User.findOne({ username });
        if (!user || user.email !== email || user.contact !== contact) return res.status(400).send('Informations incorrectes.');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Mot de passe incorrect.');
        
        const token = jwt.sign({ userId: user._id }, 'ka23bo23re23');
        res.status(200).json({ username: user.username, email: user.email, contact: user.contact, token, message: 'Connexion réussie !' });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).send('Erreur lors de la connexion : ' + error.message);
    }
});

// Route pour passer une commande et envoyer l'email de confirmation
app.post('/api/order', async (req, res) => {
    const { username, email, contact, price, quantity, weight, Produit: nomproduit } = req.body;
    try {
        const mailOptions = {
            from: 'kaboreabwa2020@gmail.com',
            to: email,
            subject: 'Confirmation de commande',
            text: `Merci, ${username}, pour votre commande ! Détails :\n- Produit : ${nomproduit}\n- Prix : ${price} FCFA\n- Quantité : ${quantity}\n- Poids : ${weight} kg\n\nNous vous contacterons au ${contact} pour valider la commande.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).send('Erreur lors de l\'envoi de l\'e-mail : ' + error.message);
            res.status(200).send('Commande passée avec succès et e-mail envoyé !');
        });
    } catch (error) {
        console.error('Erreur lors de la commande :', error);
        res.status(500).send('Erreur lors de la commande : ' + error.message);
    }
});

//Ajout

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




// Routes pour gérer les annonces
app.post('/api/annonces', async (req, res) => {
    try {
        const annonce = new Annonce(req.body);
        await annonce.save();
        res.status(201).json({ message: 'Annonce ajoutée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'annonce' });
    }
});

app.get('/api/annonces', async (req, res) => {
    try {
        const annonces = await Annonce.find();
        res.json(annonces);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du chargement des annonces' });
    }
});

// Routes pour gérer les messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (error) {
        res.status(400).json(error);
    }
});

app.post('/api/messages', async (req, res) => {
    const { username, content } = req.body;
    try {
        const newMessage = new Message({ username, content });
        const message = await newMessage.save();
        io.emit('newMessage', message);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Ajout

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





// Route pour servir le fichier users.html
app.get('/users', (req, res) => {
    res.sendFile(__dirname + '/public/users.html');
});

// Route pour servir le fichier Visiteur.html
app.get('/Visiteur', (req, res) => {
    res.sendFile(__dirname + '/public/Visiteur.html');
});




// Formation 

// Create a schema for videos
const videoSchema = new mongoose.Schema({
    filename: String,
    path: String,
    date: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// Routes
app.get('/formation', (req, res) => {
    Video.find({}, (err, videos) => {
        if (err) return res.status(500).send(err);
        res.sendFile(path.join(__dirname, 'public', 'Formation.html'));
    });
});

app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier n\'a été téléchargé.');
    }
    
    const newVideo = new Video({
        filename: req.file.originalname,
        path: req.file.path,
    });
    
    newVideo.save((err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/formation');
    });
});


app.get('/videos', (req, res) => {
    Video.find({}, (err, videos) => {
        if (err) return res.status(500).send(err);
        res.json(videos);
    });
});


// Exemple : suppression d'un fichier après son upload
app.post('/delete', (req, res) => {
    const { password, videoId } = req.body;
    if (password === 'ka23bo23re23') {
        Video.findById(videoId, (err, video) => {
            if (err) return res.status(500).send(err);
            if (video) {
                fs.unlink(video.path, (err) => {
                    if (err) return res.status(500).send(err);
                    // Supprimez le document de la base de données
                    Video.findByIdAndRemove(videoId, (err) => {
                        if (err) return res.status(500).send(err);
                        res.redirect('/formation');
                    });
                });
            } else {
                res.status(404).send('Vidéo non trouvée');
            }
        });
    } else {
        res.status(403).send('Unauthorized');
    }
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
