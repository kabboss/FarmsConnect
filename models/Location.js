const mongoose = require('mongoose');

// Schéma pour la localisation de l'utilisateur
const locationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // référence à l'utilisateur dans le modèle User
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Modèle Location
const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
