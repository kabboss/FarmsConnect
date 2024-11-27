const mongoose = require('mongoose');

// Définir le schéma pour les données collectées
const collecteDonneesSchema = new mongoose.Schema(
  {
    // Informations personnelles
    Nom_prenom: { type: String, required: true },
    Numero_telephone: { type: String, required: true }, // Pour éviter la perte de zéros initiaux
    Numero_telephone2: { type: String, required: true },
    age: { type: Number, required: true },
    region: { type: String, required: true },
    sexe: { type: String, required: true },
    education: { type: String },

    // Informations sur l'élevage
    type_elevage: { type: String, required: true },
    nombre_animaux: { type: Number, required: true },
    surface_elevage: { type: Number }, // en hectares
    revenus_elevage: { type: String, required: true },
    mode_alimentation: { type: String, required: true },
    acces_eau: { type: String, required: true },

    // Problématiques rencontrées
    defis: { type: [String] }, // Liste de défis sélectionnés

    // Pratiques environnementales
    dechets_animaux: { type: String },
    biodiversite: { type: String },

    // Financement et besoins
    financement: { type: String, required: true },
    besoin_financier: { type: String },

    // Perspectives futures
    plan_futur: { type: String },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);

// Créer le modèle à partir du schéma
const CollecteDonnees = mongoose.model('CollecteDonnees', collecteDonneesSchema);

module.exports = CollecteDonnees;
