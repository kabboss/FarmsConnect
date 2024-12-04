const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true // Ajout d'un index explicite pour optimiser les requêtes
    },
    password: {
        type: String,
        required: true,
        minlength: 4, // Longueur minimale pour le mot de passe
        maxlength: 100 // Longueur maximale pour le mot de passe
    },
    email: {
        type: String,
        required: true,
        unique: true, // Assure que chaque email est unique
        index: true, // Ajout d'un index explicite pour optimiser les requêtes
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer une adresse email valide.'] // Validation de format pour les emails
    },
    contact: {
        type: String,
        required: true
    },
    userType: { 
        type: String, 
        required: true, 
        enum: ["vendeur", "visiteur", "veterinaire", "eleveur"] // Liste des valeurs autorisées
    },
    createdAt: {
        type: Date,
        default: Date.now // Valeur par défaut : date et heure actuelles
    },
    
});

// Création du modèle utilisateur
const User = mongoose.model('User', userSchema);

module.exports = User; // Export du modèle pour une utilisation dans d'autres fichiers
