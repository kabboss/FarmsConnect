// Importer les dépendances
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const User = require('./models/User'); // Assurez-vous que le modèle User est correctement importé
const Message = require('./models/message'); // Assurez-vous que le modèle Message est également importé
const http = require('http');
const socketIo = require('socket.io');


// Créer une instance de l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());
app.use(bodyParser.json());

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Appliquer le middleware CORS sans options (autorise toutes les origines par défaut)
app.use(cors({
    origin: 'https://farmsconnect-b084ddb02391.herokuapp.com', // ou '*' pour autoriser toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


mongoose.connect('mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority', {
})
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

// Route pour s'inscrire (signup)
app.post('/api/signup', async (req, res) => {
    const { username, email, contact, password, userType } = req.body;

    try {
        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Cet utilisateur existe déjà.');
        }

        // Hachage du mot de passe avant de l'enregistrer
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur avec le mot de passe haché
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
        // Vérifier que tous les champs sont fournis
        if (!username || !email || !contact || !password) {
            return res.status(400).send('Veuillez fournir le nom d’utilisateur, l\'email, le contact et le mot de passe.');
        }

        // Trouver l'utilisateur en fonction du nom d'utilisateur
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('Nom d’utilisateur incorrect.');
        }

        // Vérifier que l'email et le contact correspondent
        if (user.email !== email || user.contact !== contact) {
            return res.status(400).send('Email ou contact incorrect.');
        }

        // Vérifier que le mot de passe est correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Mot de passe incorrect.');
        }

        // Générer un token JWT
        const token = jwt.sign({ userId: user._id }, 'ka23bo23re23'); // Remplacez par une vraie clé secrète

        // Envoyer la réponse de connexion réussie
        res.status(200).json({ username: user.username, email: user.email, contact: user.contact, token, message: 'Connexion réussie !' });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).send('Erreur lors de la connexion : ' + error.message);
    }
});

// Route pour passer une commande et envoyer l'email
app.post('/api/order', async (req, res) => {
    console.log('Données reçues :', req.body);

    // Déconstruction des informations nécessaires de la requête
    const { username, email, contact, price, quantity, weight, Produit: nomproduit } = req.body;

    // Vérification des informations nécessaires
    if (!username || !nomproduit || !email || !contact || !price || !quantity || !weight) {
        console.error('Informations manquantes dans la requête :', req.body);
        return res.status(400).send('Veuillez fournir toutes les informations nécessaires : username, nom du produit, email, contact, prix, quantité et poids.');
    }

    try {
        // Préparer les options de l'e-mail
        const mailOptions = {
            from: 'kaboreabwa2020@gmail.com',
            to: email,
            subject: 'Confirmation de commande',
            text: `Merci, ${username}, pour votre commande !\n\nVoici les détails :\n- Produit : ${nomproduit}\n- Prix total : ${price} FCFA\n- Quantité : ${quantity}\n- Poids total : ${weight} kg\n\nNous vous contacterons au numéro ${contact} pour valider la commande.\n\nNB : Les animaux subiront un contrôle de santé avec l'un de nos vétérinaires, et vous serez livré dans un délai de 24 heures maximum. Le paiement se fera à la livraison.`
        };

        // Envoyer l'e-mail
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

// Routes pour les messages
app.get('/api/messages', (req, res) => {
    Message.find()
        .then(messages => res.json(messages))
        .catch(err => res.status(400).json(err));
});

app.post('/api/messages', (req, res) => {
    const { content } = req.body;
    const newMessage = new Message({ content });
    newMessage.save()
        .then(savedMessage => {
            io.emit('newMessage', savedMessage);
            res.status(201).json(savedMessage);
        })
        .catch(err => res.status(400).json(err));
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
    const { username, password } = req.body; // Ne pas stocker le mot de passe en clair
    const newUser = new User({ username, password });
    newUser.save()
        .then(savedUser => res.status(201).json(savedUser))
        .catch(err => res.status(400).json(err));
});

app.get('/api/users', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json(err));
});

app.get('/api/users/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if (!user) return res.status(404).send();
            res.json(user);
        })
        .catch(err => res.status(400).json(err));
});

app.put('/api/users/:id', (req, res) => {
    const { username, password } = req.body; // Ne pas stocker le mot de passe en clair
    User.findByIdAndUpdate(req.params.id, { username, password }, { new: true })
        .then(updatedUser => res.json(updatedUser))
        .catch(err => res.status(400).json(err));
});

app.delete('/api/users/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(400).json(err));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3002; // 3002 est un port par défaut
app.listen(PORT, () => {
    console.log(`Le serveur est en marche sur le port ${PORT}...`);
});




// Toujours dans server.js ou app.js
const Annonce = require('./models/Annonce'); // Assure-toi que le chemin du modèle est correct

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
