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

// Créer une instance de l'application Express
const app = express();

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());
app.use(bodyParser.json());

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Appliquer le middleware CORS sans options (autorise toutes les origines par défaut)
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority')
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

// Route pour ajouter un message
app.post('/api/messages', async (req, res) => {
    const { username, content } = req.body;
    const message = new Message({ username, content });
    await message.save();
    res.status(201).send(message);
});

// Route pour ajouter une réponse à un message
app.post('/api/messages/:id/replies', async (req, res) => {
    const { id } = req.params;
    const { username, content } = req.body;

    const message = await Message.findById(id);
    message.replies.push({ username, content });
    await message.save();
    
    res.status(200).send(message);
});

// Route pour obtenir tous les messages
app.get('/api/messages', async (req, res) => {
    const messages = await Message.find();
    res.send(messages);
});

// Démarrer le serveur
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Le serveur est en marche sur le port ${PORT}...`);
});
