// Chargement du client MongoDB
const { MongoClient } = require("mongodb");

// URL de connexion MongoDB (remplace avec tes informations MongoDB si nécessaire)
const url = "mongodb+srv://kabboss:ka23bo23re23@cluster0.uy2xz.mongodb.net/FarmsConnect?retryWrites=true&w=majority";
const client = new MongoClient(url);

// Nom de la base de données et de la collection
const dbName = "FarmsConnect_updates"; // Nom de la base de données
const collectionName = "updates"; // Nom de la collection

// Fonction pour insérer une mise à jour
async function insertUpdate() {
  try {
    console.log("Tentative de connexion à MongoDB..."); // Ajouter un log avant la connexion
    // Connexion au client MongoDB
    await client.connect();
    console.log("Connexion à la base de données réussie!");

    // Sélection de la base de données et de la collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Objet de la nouvelle mise à jour
    const update = {
      version: "1.3.0", // Version de la mise à jour


      downloadUrl: "https://drive.google.com/uc?export=download&id=1KwLZyucJ3odQ5hPEfayg7zav-_U0_Gjh", // Lien de téléchargement
      message: "Nouvelle version avec des améliorations majeures et des corrections de bugs.", // Description de la mise à jour
      createdAt: new Date() // Ajout de la date et heure d'insertion
    };

    console.log("Insertion de la mise à jour..."); // Log avant l'insertion
    // Insertion dans la collection
    const result = await collection.insertOne(update);

    console.log(`Mise à jour ajoutée avec succès ! ID : ${result.insertedId}`);
  } catch (err) {
    console.error("Erreur lors de l'insertion de la mise à jour :", err);
  } finally {
    // Fermeture de la connexion au client MongoDB
    await client.close();
    console.log("Connexion fermée.");
  }
}

// Exécution de la fonction
insertUpdate();
