const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
    categorie: { type: String, required: true },
    nom: { type: String, required: true },
    nombre: { type: Number, required: true, min: 1 },
    poids: { type: Number, required: true, min: 0 },
    prix: { type: Number, required: true, min: 0 },
    images: {
        type: [String],
        validate: [arrayLimit, 'Maximum de 6 images par annonce']
    },
    contactPrincipal: { type: String, required: true },
    contactSecondaire: { type: String },
    emailVendeur: { type: String, required: true },
    codeVendeur: { type: String, required: true, index: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    dateAjout: { type: Date, default: Date.now }
});

// Fonction de validation pour la limite d'images
function arrayLimit(val) {
    return val.length <= 6;
}

module.exports = mongoose.model('Annonce', annonceSchema);
