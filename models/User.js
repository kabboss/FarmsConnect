const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Assurez-vous que chaque nom d'utilisateur est unique
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Assurez-vous que chaque email est unique
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer une adresse email valide.']
    },
    contact: {
        type: String,
        required: true
    },
    userType: { 
        type: String, 
        required: true, 
        enum: ["vendeur", "visiteur", "veterinaire", "eleveur"], // Valeurs autorisées
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User; // Assurez-vous que cela est présent
