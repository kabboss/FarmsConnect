const mongoose = require('mongoose');

// Définition du schéma pour les messages
const messageSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true // Le nom d'utilisateur est requis
    },
    content: { 
        type: String, 
        required: true // Le contenu du message est requis
    },
    replies: [
        {
            username: { 
                type: String, 
                required: true // Le nom d'utilisateur pour la réponse est requis
            },
            content: { 
                type: String, 
                required: true // Le contenu de la réponse est requis
            },
            timestamp: { 
                type: Date, 
                default: Date.now // La date de la réponse est par défaut à la date actuelle
            },
        },
    ],
    timestamp: { 
        type: Date, 
        default: Date.now // La date du message est par défaut à la date actuelle
    },
});

// Création du modèle Message à partir du schéma
const Message = mongoose.model("Message", messageSchema);

// Exportation du modèle pour l'utiliser dans d'autres fichiers
module.exports = Message;
