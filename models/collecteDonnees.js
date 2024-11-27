const mongoose = require('mongoose');

// Définir le schéma pour les données collectées
const collecteDonneesSchema = new mongoose.Schema(
  {
    // Informations personnelles
    Nom_prenom: { type: String, required: true },
    Numero_telephone: { type: String, required: true }, // Pour éviter la perte de zéros initiaux
    Numero_telephone2: { type: String, required: true },
    age: { type: Number, required: true },
    region: { 
      type: String, 
      required: true, 
      enum: [
        "Boucle du Mouhoun",
        "Cascades",
        "Centre",
        "Centre-Est",
        "Centre-Nord",
        "Centre-Ouest",
        "Centre-Sud",
        "Est",
        "Hauts-Bassins",
        "Nord",
        "Plateau-Central",
        "Sahel",
        "Sud-Ouest",
      ]
    },
    Localite: { type: String, required: true },
    sexe: { type: String, required: true },
    education: { type: String },

    // Informations sur l'élevage
    type_elevage: {
      type: [String], // Tableau de chaînes de caractères pour plusieurs choix
      required: true
    },
    nombre_animaux: { type: Number, required: true },
    revenus_elevage: { type: String, required: true },
    mode_alimentation: { type: String, required: true },
    acces_eau: { type: String, required: true },

    // Problématiques rencontrées
    defis: {
      type: [String], // Tableau de chaînes pour permettre plusieurs réponses
      required: false
    },
    autres_defis: {
      type: String, // Si "Autres" est sélectionné, l'utilisateur peut spécifier un défi supplémentaire
      required: false
    },

    // Pratiques environnementales
    dechets_animaux: { type: String },

    // Technologies et innovations
    utilisation_technologie: { type: String }, // Oui/Non
    technologies_utilisees: { type: String }, // Détails des technologies utilisées

    // Accès à la formation
    acces_formation: { type: String }, // Oui/Non
    type_formation: { type: String }, // Détails des types de formation reçues

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
