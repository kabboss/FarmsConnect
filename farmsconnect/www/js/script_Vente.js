// Fonction pour traiter le formulaire de vente d'un animal
document.getElementById('vente-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche l'envoi par défaut du formulaire

    // Récupération des informations de l'animal
    const animal = {
        categorie: document.getElementById('categorie').value,
        nomAnimal: document.getElementById('nom-animal').value,
        race: document.getElementById('race').value,
        age: document.getElementById('age').value,
        sexe: document.querySelector('input[name="sexe"]:checked').value,
        description: document.getElementById('description').value,
        images: []
    };

    // Récupération des fichiers image et conversion en base64
    const files = document.getElementById('images').files;
    const imagePromises = [];
    for (let file of files) {
        const reader = new FileReader();
        const imagePromise = new Promise((resolve, reject) => {
            reader.onloadend = () => {
                animal.images.push(reader.result);
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        imagePromises.push(imagePromise);
    }

    // Attendre que toutes les images soient lues avant de continuer
    await Promise.all(imagePromises);

    // Récupération de la position géographique du vendeur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            animal.vendeurLatitude = position.coords.latitude;
            animal.vendeurLongitude = position.coords.longitude;

            try {
                // Envoi des données via une requête POST
                const response = await fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/vente', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(animal)
                });

                // Vérification de la réponse
                const data = await response.json();
                if (response.ok) {
                    alert('Annonce ajoutée avec succès !');
                    document.getElementById('vente-form').reset(); // Réinitialise le formulaire
                } else {
                    alert('Erreur lors de l\'ajout de l\'annonce: ' + data.message);
                }
            } catch (error) {
                alert('Erreur lors de la communication avec le serveur: ' + error.message);
            }
        }, function(error) {
            alert("La géolocalisation est nécessaire pour ajouter une annonce. Erreur: " + error.message);
        });
    } else {
        alert("La géolocalisation n'est pas disponible sur ce navigateur.");
    }
});
