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
const path = require('path');
const Grid = require('gridfs-stream');
const cookieParser = require('cookie-parser');
const router = express.Router();



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
app.use(cookieParser());  // Ajoutez cette ligne avant votre middleware `verifyToken`


// Configuration CORS pour permettre les requêtes provenant de l'origine spécifiée
const corsOptions = {
    origin: '*', // Remplacez par l'URL de votre frontend (application mobile ou web)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Permet l'utilisation des credentials (cookies, authentification)
  };
  
  app.use(cors(corsOptions));  // Applique la configuration CORS

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

        const token = jwt.sign({ userId: user._id ,  email: user.email }, process.env.JWT_SECRET || 'ka23bo23re23', {
            expiresIn: "1h",
        });


       // Stocker le token dans un cookie
       res.cookie('token', token, {
        httpOnly: true, // Assurer que le cookie est inaccessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Utiliser HTTPS en production
        maxAge: 3600000, // 1 heure
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









// Route pour passer une commande et envoyer les emails de confirmation
app.post('/api/order', async (req, res) => {
    const { username, email, contact, price, quantity, weight, Produit: nomproduit, traitement, typeAbattage } = req.body;

    // Vérifiez si traitement est défini
    if (!traitement) {
        console.error("Erreur : La variable 'traitement' est manquante dans la requête.");
        return res.status(400).json({ error: "L'option de traitement est requise." });
    }

    try {
        // Récupérer les coordonnées GPS à partir de la collection "Location"
        const locationData = await Location.findOne({ email: email });  // Si tu veux utiliser email, sinon change pour userID

        if (!locationData) {
            return res.status(400).send('Localisation non trouvée pour cet utilisateur.');
        }

        const { latitude, longitude } = locationData;

        // Préparer l'email pour le client
        const mailOptionsClient = {
            from: 'kaboreabwa2020@gmail.com',
            to: email,
            subject: 'Confirmation de commande',
            text: `
            Merci, ${username}, pour votre commande ! 🛒 
            
            📋 **Détails de votre commande :**
            - **Produit** : ${nomproduit}
            - **Prix Total à payer** : ${price} FCFA (Livraison gratuite)
            - **Quantité** : ${quantity}
            - **Poids Total** : ${weight} kg 
              *(NB : Par défaut, le poids commercialisé est de 2 kg. Une augmentation de 0,1 kg sera facturée à 70 FCFA)*
            - **Traitement choisi** : ${traitement}
            - **Type d'abattage** : ${typeAbattage}
            
            📞 **Nous vous contacterons prochainement sur votre numéro ${contact} pour valider la commande.**
            
            💬 **Vous avez des questions ou souhaitez nous contacter immédiatement ?**
            👉 Cliquez ici pour nous joindre sur WhatsApp : [Nous contacter sur WhatsApp](https://wa.me/+22656663638)
            `
                    };

        // Envoi de l'email au client
        transporter.sendMail(mailOptionsClient, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'email au client :', error);
                return res.status(500).send('Erreur lors de l\'envoi de l\'email au client : ' + error.message);
            }
            console.log('Email envoyé au client:', info.response);
        });

        // Préparer l'email pour Farmsconnect
        const mailOptionsFarmsconnect = {
            from: 'kaboreabwa2020@gmail.com',
            to: 'kaboreabwa2020@gmail.com', // Destinataire: Farmsconnect
            subject: 'Nouvelle commande reçue',
            text: `
            📦 **Nouvelle commande reçue !**
            
            📋 **Détails de la commande :**
            - **Client** : ${username}
            - **Email** : ${email}
            - **Contact** : ${contact}
            - **Produit** : ${nomproduit}
            - **Prix Total** : ${price} FCFA
            - **Quantité** : ${quantity}
            - **Poids Total** : ${weight} kg
              *(NB : Par défaut, le poids commercialisé est de 2 kg. Une augmentation de 0,1 kg sera facturée à 70 FCFA.)*
            - **Traitement** : ${traitement}
            - **Type d'abattage** : ${typeAbattage}
            
            🛠️ **Veuillez traiter cette commande dans les meilleurs délais.**
            `
                    };

        // Envoi de l'email à Farmsconnect
        transporter.sendMail(mailOptionsFarmsconnect, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'email à Farmsconnect :', error);
                return res.status(500).send('Erreur lors de l\'envoi de l\'email à Farmsconnect : ' + error.message);
            }
            console.log('Email envoyé à Farmsconnect:', info.response);
        });

        // Si tout est OK, répondre à la demande
        res.status(200).send('Commande passée avec succès, e-mails envoyés !');
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





app.post('/api/annonces', async (req, res) => {
    const { emailVendeur, contactPrincipal } = req.body;

    try {
        // Vérifiez le nombre d'annonces existantes pour ce vendeur
        const annoncesExistantes = await Annonce.find({
            emailVendeur,
            contactPrincipal
        });

        if (annoncesExistantes.length >= 3) {
            return res.status(400).json({
                message: 'Vous avez atteint le nombre maximal de 3 annonces autorisées.'
            });
        }

        // Si tout est bon, enregistrez l'annonce
        const nouvelleAnnonce = new Annonce(req.body);
        await nouvelleAnnonce.save();

        res.status(201).json({
            message: 'Annonce ajoutée avec succès !',
            annonce: nouvelleAnnonce
        });
    } catch (error) {
        console.error('Erreur lors de l’ajout de l’annonce:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = app;






app.get('/api/annonces/count', async (req, res) => {
    const { vendeur, contact } = req.query;

    try {
        const annoncesCount = await Annonce.countDocuments({ 
            emailVendeur: vendeur, 
            contactPrincipal: contact 
        });
        res.status(200).json({ annoncesCount });
    } catch (error) {
        console.error('Erreur lors de la récupération des annonces:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
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
  




  
  app.post('/api/schedule-email', async (req, res) => {
      const { purchaseDetails, delay } = req.body;
  
      // Calculer l'heure de planification (ici 2 minutes après l'achat)
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + delay);
  
      const mailOptionsClient = {
          from: 'kaboreabwa2020@gmail.com',
          to: purchaseDetails.email,    // Email du client
          subject: 'Merci pour votre achat !',
          text: `👋 Bonjour ${purchaseDetails.username},

          ✨ **Merci pour votre achat !**  
          Votre satisfaction nous tient à cœur 💖. Nous vous invitons à partager votre expérience avec nous en répondant à ce rapide formulaire de feedback 📝 :  
          
          🔗 [**Donnez votre avis ici !**](https://ee.kobotoolbox.org/x/uhCnWFCN)
          
          🌟 Vos retours nous aident à améliorer nos services et à vous offrir la meilleure expérience possible.  
          
          Merci de faire confiance à *FarmsConnect* 🚜🐓.  
          À bientôt !  
          
          📧 *Pour toute question, contactez-nous directement.*  
          `
                };
  
      // Planifier l'envoi de l'email au client après le délai spécifié (2 minutes)
      schedule.scheduleJob(scheduledTime, async () => {
          try {
              await transporter.sendMail(mailOptionsClient);
              console.log('Email envoyé au client après 2 minutes');
          } catch (error) {
              console.error('Erreur lors de l\'envoi de l\'email au client :', error);
          }
      });
  
      res.json({ success: true, message: 'Email planifié pour le client dans 2 minutes.' });
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





// Route pour enregistrer ou mettre à jour la localisation
app.post('/api/save-location', async (req, res) => {
    const { latitude, longitude, email } = req.body;  // Récupérer email, latitude et longitude

    if (!latitude || !longitude) {
        return res.status(400).send("Latitude et longitude sont requis.");
    }

    if (!email || !email.includes('@')) {
        return res.status(400).send("Un email valide est requis.");
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingLocation = await Location.findOne({ email: email });

        if (existingLocation) {
            // Si l'utilisateur existe, on met à jour ses coordonnées
            existingLocation.latitude = latitude;
            existingLocation.longitude = longitude;

            await existingLocation.save();  // Sauvegarder les modifications

            res.status(200).json({ message: "Localisation mise à jour avec succès." });
        } else {
            // Si l'utilisateur n'existe pas, on enregistre une nouvelle localisation
            const newLocation = new Location({
                email: email,
                latitude: latitude,
                longitude: longitude,
            });

            await newLocation.save();  // Sauvegarder la localisation dans la base de données

            res.status(200).json({ message: "Localisation enregistrée avec succès." });
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la localisation :", error.message);
        res.status(500).send("Erreur serveur : " + error.message);
    }
});








//Map 



// API - Récupérer les utilisateurs avec leurs localisations


app.get('/api/map', async (req, res) => {
    try {
      // Récupérer tous les utilisateurs sauf les visiteurs
      const users = await User.find(
        { userType: { $ne: 'visiteur' } },  // Exclure les visiteurs
        'userType username email _id'  // Champs nécessaires
      );
  
      // Récupérer les dernières localisations pour chaque utilisateur
      const locations = await Location.aggregate([
        { $match: { userId: { $in: users.map(user => user._id) } } },
        {
          $group: {
            _id: "$userId",
            latitude: { $last: "$latitude" },
            longitude: { $last: "$longitude" }
          }
        }
      ]);
  
      // Fusionner les utilisateurs avec leurs localisations
      const mapData = users
        .map(user => {
          const location = locations.find(loc => loc._id.toString() === user._id.toString());
          if (location) {
            return {
              username: user.username,
              email: user.email,
              userType: user.userType,
              location: { type: 'Point', coordinates: [location.longitude, location.latitude] }
            };
          }
          return null; // Exclure si pas de localisation
        })
        .filter(user => user !== null); // Supprimer les utilisateurs sans localisation
  
      res.json(mapData);  // Retourner les données au frontend
    } catch (err) {
      console.error('Erreur lors de la récupération des données de la map :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    }
  });
  






// Regroupe annonce 

// Route pour récupérer les annonces classées par catégorie et par fourchette de prix avec pagination
router.get('/annonces', async (req, res) => {
    try {
        // Récupérer les paramètres de pagination depuis la requête
        const page = parseInt(req.query.page) || 1;  // Par défaut page 1 si non spécifié
        const limit = parseInt(req.query.limit) || 10;  // Par défaut 10 résultats par page

        // Calculer l'index de départ
        const skip = (page - 1) * limit;

        // Tris et groupement par catégorie et fourchette de prix avec pagination
        const annonces = await Annonce.aggregate([
            { $sort: { categorie: 1, prix: 1 } },

            // Grouper par catégorie
            {
                $group: {
                    _id: "$categorie", // Groupement par catégorie
                    annonces: { $push: "$$ROOT" }, // Ajouter tous les produits dans un tableau
                }
            },

            // Optionnel : Utiliser $bucket pour diviser les prix en tranches
            {
                $project: {
                    _id: 1,
                    annonces: {
                        $map: {
                            input: "$annonces",
                            as: "annonce",
                            in: {
                                $let: {
                                    vars: {
                                        priceBucket: {
                                            $switch: {
                                                branches: [
                                                    { case: { $lte: ["$$annonce.prix", 500] }, then: "0-500" },
                                                    { case: { $lte: ["$$annonce.prix", 1000] }, then: "501-1000" },
                                                    { case: { $lte: ["$$annonce.prix", 2000] }, then: "1001-2000" },
                                                    { case: { $lte: ["$$annonce.prix", 5000] }, then: "2001-5000" },
                                                    { case: { $gt: ["$$annonce.prix", 5000] }, then: "5000+" }
                                                ],
                                                default: "Autres",
                                            }
                                        }
                                    },
                                    in: {
                                        annonce: "$$annonce",
                                        priceBucket: "$$priceBucket"
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // Grouper les produits par fourchette de prix
            {
                $group: {
                    _id: { categorie: "$_id", prixRange: "$annonces.priceBucket" }, // Catégorie et fourchette de prix
                    produits: { $push: "$annonces" }
                }
            },

            // Tri final des résultats
            {
                $sort: { "_id.categorie": 1, "_id.prixRange": 1 }
            },

            // Appliquer le skip et le limit pour la pagination
            { $skip: skip },
            { $limit: limit }
        ]);

        // Obtenir le nombre total de résultats (sans pagination)
        const totalCount = await Annonce.countDocuments();

        // Calculer le nombre total de pages
        const totalPages = Math.ceil(totalCount / limit);

        // Réponse structurée avec pagination
        res.json({
            totalPages,
            currentPage: page,
            totalCount,
            annonces
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des annonces' });
    }
});

module.exports = router;










// mise a jour 

// Middleware pour autoriser les requêtes CORS
app.use(cors()); // Autorise toutes les origines par défaut

  // URL de connexion MongoDB
const url = "mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority";
const client = new MongoClient(url);

// Nom de la base de données et de la collection
const dbName = "FarmsConnect_updates"; // Nom de la base de données
const collectionName = "updates"; // Nom de la collection

app.get("/get-update", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Récupérer la dernière mise à jour
    const latestUpdate = await collection.find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (latestUpdate.length === 0) {
      return res.status(404).send("Aucune mise à jour trouvée.");
    }

    res.json(latestUpdate[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération de la mise à jour :", err);
    res.status(500).send("Erreur serveur");
  } finally {
    await client.close();
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









