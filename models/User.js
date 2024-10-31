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
    },
    contact: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['Vendeur', 'Acheteur', 'Visiteur'], // Options pour le type d'utilisateur
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User; // Assurez-vous que cela est présent
