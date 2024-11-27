// Importer les dépendances
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');

// Modèles
const User = require('./models/User');
const Message = require('./models/message');
const Annonce = require('./models/Annonce');
const CollecteDonnees = require('./models/collecteDonnees');
const Location = require('./models/Location');  // Importer le modèle Location



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
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Connexion à MongoDB
const mongoURI = 'mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connecté à MongoDB...'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Initialisation de GridFS pour stocker les fichiers de formation
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Configuration du stockage GridFS avec multer pour le téléversement de fichiers
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => ({
        filename: `file_${Date.now()}${path.extname(file.originalname)}`,
        bucketName: 'uploads'
    })
});
const upload = multer({ storage });

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kaboreabwa2020@gmail.com',
        pass: 'swbo vejr klic otpu'
    }
});


// Routes d'authentification

// Route pour l'inscription 
app.post('/api/signup', async (req, res) => {
    const { username, email, contact, password, userType } = req.body;

    // Vérification que tous les champs sont fournis
    if (!username || !email || !contact || !password || !userType) {
        return res.status(400).send("Tous les champs sont requis.");
    }

    // Vérification que userType est valide
    const validUserTypes = ["vendeur", "visiteur", "veterinaire", "eleveur"];
    if (!validUserTypes.includes(userType)) {
        return res.status(400).send("Type d'utilisateur invalide.");
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).send('Cet utilisateur existe déjà.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, contact, password: hashedPassword, userType });
        await newUser.save();

        res.status(201).send('Utilisateur créé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l’inscription :', error);
        res.status(500).send('Erreur serveur : ' + error.message);
    }
});



// Route pour la connexion
app.post('/api/login', async (req, res) => {
    const { username, email, contact, password } = req.body;

    if (!username || !email || !contact || !password) {
        return res.status(400).send("Tous les champs sont requis.");
    }

    try {
        const user = await User.findOne({ username });
        if (!user || user.email !== email || user.contact !== contact) {
            return res.status(400).send('Informations incorrectes.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Mot de passe incorrect.');

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'ka23bo23re23', {
            expiresIn: "1h",
        });

        res.status(200).json({
            username: user.username,
            email: user.email,
            contact: user.contact,
            token,
            message: 'Connexion réussie !',
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).send('Erreur serveur : ' + error.message);
    }
});

module.exports = app;







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


// Création d'un modèle pour les commentaires
const Comment = mongoose.model('Comment', new mongoose.Schema({
    username: String,
    message: String,
    date: { type: Date, default: Date.now }
  }));
  
  // Middleware pour les fichiers statiques
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: true }));
  app.set('view engine', 'ejs');
  
  // Route principale pour afficher la page de formation
  app.get('/', async (req, res) => {
    const comments = await Comment.find();
    res.render('index', { comments });
  });
  
  // Route pour ajouter un commentaire
  app.post('/comment', async (req, res) => {
    const { username, message } = req.body;
    const comment = new Comment({ username, message });
    await comment.save();
    res.redirect('/');
  });
  
  // Serveur WebSocket pour gérer le chat en temps réel
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');
    
    // Écoute des messages de chat
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg); // Diffuse à tous les clients
    });
  
    socket.on('disconnect', () => {
      console.log('Un utilisateur a quitté');
    });
  });
  




  
  
  
  // Route pour planifier l'email
  app.post('/api/schedule-email', async (req, res) => {
      const { purchaseDetails, delay } = req.body;
  
      // Calculer l'heure de planification (par exemple, 24 heures après l'achat)
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + delay);
  
      // Préparer l'email pour le client
      const mailOptionsClient = {
          from: 'kaboreabwa2020@gmail.com',
          to: purchaseDetails.email,    // Email du client
          subject: 'Merci pour votre achat !',
          text: `Bonjour ${purchaseDetails.username},\n\nMerci pour votre achat ! Nous vous envoyons ce lien pour un feedback sur votre expérience d'achat :\n\nhttps://ee.kobotoolbox.org/x/uhCnWFCN.`
      };
  
      // Planifier l'envoi de l'email au client après le délai spécifié (24h)
      schedule.scheduleJob(scheduledTime, async () => {
          try {
              await transporter.sendMail(mailOptionsClient);
              console.log('Email envoyé au client après 24h');
          } catch (error) {
              console.error('Erreur lors de l\'envoi de l\'email au client :', error);
          }
      });
  
      res.json({ success: true, message: 'Email planifié pour le client dans 24h.' });
  });
  
  
 

// Route pour enregistrer les données collectées
app.post('/api/questions', async (req, res) => {
  try {
    // Récupérer les données envoyées dans la requête
    const {
      Nom_prenom,
      Numero_telephone,
      Numero_telephone2,
      age,
      region,
      Localite,
      sexe,
      education,
      type_elevage,
      nombre_animaux,
      revenus_elevage,
      mode_alimentation,
      acces_eau,
      defis,
      autres_defis,
      dechets_animaux,
      biodiversite,
      financement,
      besoin_financier,
      utilisation_technologie,
      technologies_utilisees,
      acces_formation,
      type_formation,
      plan_futur
    } = req.body;

    // Créer une nouvelle entrée dans la base de données MongoDB
    const collecteDonnees = new CollecteDonnees({
      Nom_prenom,
      Numero_telephone,
      Numero_telephone2,
      age,
      region,
      Localite,
      sexe,
      education,
      type_elevage,
      nombre_animaux,
      revenus_elevage,
      mode_alimentation,
      acces_eau,
      defis, // Liste des défis sélectionnés
      autres_defis,
      dechets_animaux,
      biodiversite,
      financement,
      besoin_financier,
      utilisation_technologie,
      technologies_utilisees,
      acces_formation,
      type_formation,
      plan_futur
    });

    // Sauvegarder les données dans la base de données MongoDB
    await collecteDonnees.save();

    // Réponse en cas de succès
    res.status(201).json({
      message: 'Données collectées avec succès.',
      collecteDonnees,
    });
  } catch (error) {
    // En cas d'erreur, loguer l'erreur et renvoyer une réponse d'erreur
    console.error('Erreur lors de l\'enregistrement des données:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de l\'enregistrement des données.',
      error: error.message, // Ajoutez l'erreur pour plus de détails
    });
  }
});

// Exporter l'application Express
module.exports = app;

// Route pour enregistrer la localisation de l'utilisateur
app.post('/api/save-location', async (req, res) => {
    const { email, latitude, longitude } = req.body;

    // Vérifier que tous les champs sont présents
    if (!email || !latitude || !longitude) {
        return res.status(400).send("Tous les champs sont requis.");
    }

    try {
        // Créer un nouvel enregistrement de localisation
        const newLocation = new Location({
            email,
            latitude,
            longitude,
            date: new Date(),
        });

        // Enregistrer la localisation dans la base de données
        await newLocation.save();

        res.status(201).send("Localisation enregistrée avec succès !");
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la localisation :', error);
        res.status(500).send("Erreur serveur : " + error.message);
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
