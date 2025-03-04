const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  categorie: { type: String, required: true },
  nombre: { type: Number, required: true, min: 1 },
  poids: { type: Number, required: true, min: 0 },
  prix: { type: Number, required: true, min: 0 },
  prixFinal: { type: Number, required: true, min: 0 },
  images: {
    type: [String],
    validate: {
      validator: (val) => val.length <= 3,
      message: 'Maximum de 3 images par annonce',
    },
  },
  contactPrincipal: { type: String, required: true },
  contactSecondaire: { type: String },
  emailVendeur: { type: String, required: true },
  codeVendeur: { type: String, required: true, index: true },
  location: { 
    latitude: Number,
    longitude: Number
},
  dateAjout: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Annonce', annonceSchema);
