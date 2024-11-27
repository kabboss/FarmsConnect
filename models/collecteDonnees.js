const mongoose = require('mongoose');

// Définir le schéma pour les données collectées
const collecteDonneesSchema = new mongoose.Schema({
  // Informations personnelles
  age: { type: Number, required: true },
  region: { type: String, required: true },
  sexe: { type: String, required: true },
  education: { type: String, required: false },

  // Informations sur l'élevage
  type_elevage: { type: String, required: true },
  nombre_animaux: { type: Number, required: true },
  surface_elevage: { type: Number, required: false }, // en hectares
  revenus_elevage: { type: String, required: true },
  mode_alimentation: { type: String, required: true },
  acces_eau: { type: String, required: true },

  // Problématiques rencontrées
  defis: { type: [String], required: false }, // Liste de défis sélectionnés

  // Pratiques environnementales
  dechets_animaux: { type: String, required: false },
  biodiversite: { type: String, required: false },

  // Financement et besoins
  financement: { type: String, required: true },
  besoin_financier: { type: String, required: false },

  // Perspectives futures
  plan_futur: { type: String, required: false }
}, { timestamps: true });

// Créer le modèle à partir du schéma
const CollecteDonnees = mongoose.model('CollecteDonnees', collecteDonneesSchema);

module.exports = CollecteDonnees;
