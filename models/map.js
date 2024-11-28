const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  userType: { type: String, enum: ['vendeur', 'eleveur', 'veterinaire'], required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
});

MapSchema.index({ location: '2dsphere' }); // Indice pour les requêtes géospatiales

module.exports = mongoose.model('Map', MapSchema);
