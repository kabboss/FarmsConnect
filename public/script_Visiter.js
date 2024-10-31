document.addEventListener('DOMContentLoaded', function() {
    const animalsList = document.getElementById('animals-list');
    let annonces = JSON.parse(localStorage.getItem('annonces')) || [];

    // Fonction pour calculer la distance entre deux points géographiques
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        // Ajout de la distance à chaque annonce
        annonces.forEach(animal => {
            if (animal.location) {
                animal.distance = calculateDistance(
                    userLatitude,
                    userLongitude,
                    animal.location.latitude,
                    animal.location.longitude
                );
            } else {
                animal.distance = Infinity; // Distance infinie si la localisation n'est pas disponible
            }
        });

        // Tri des annonces en fonction de la distance
        annonces.sort((a, b) => a.distance - b.distance);

        // Affichage des annonces triées
        annonces.forEach(animal => {
            const animalCard = document.createElement('div');
            animalCard.classList.add('animal-card');
            animalCard.innerHTML = `
                <h3>${animal.nom} (${animal.categorie})</h3>
                <p>Nombre : ${animal.nombre}</p>
                <p>Poids par animal : ${animal.poids} kg</p>
                <p>Prix unitaire : ${animal.prix} FCFA</p>
                <p>Code du vendeur : ${animal.codeVendeur}</p>
                <p>Distance : ${animal.distance !== Infinity ? animal.distance.toFixed(2) + " km" : "Inconnue"}</p>
                <div class="images-section">
                    ${animal.images.map(img => `<img src="${img}" alt="Image de l'animal" />`).join('')}
                </div>
                <button class="buy-button" data-animal='${JSON.stringify(animal)}'>Acheter ce produit</button>
            `;
            animalsList.appendChild(animalCard);
        });

        // Gestion des clics sur les boutons d'achat après l'affichage des annonces
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', function() {
                const animal = JSON.parse(this.getAttribute('data-animal'));
                handlePurchase(animal);
            });
        });

    }, function(error) {
        alert("La localisation est nécessaire pour trier les annonces par proximité.");
    });
});

// Fonction pour afficher une alerte personnalisée
function showAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    // Masquer l'alerte après un certain temps (facultatif)
    setTimeout(() => {
        closeAlert();
    }, 10000); // Masquer après 10 secondes
}

function closeAlert() {
    document.getElementById("customAlert").classList.add("hidden");
}

// Remplacez `alert()` par `showAlert()` pour afficher le message dans l'alerte personnalisée
fetch('/api/endpoint', { /*... options de requête ...*/ })
    .then(response => {
        if (response.ok) {
            showAlert("Merci pour votre commande !\n\nNous l'avons bien reçue et nous vous contacterons prochainement pour organiser la livraison. Notez que chaque produit passe par un contrôle sanitaire rigoureux pour garantir sa qualité.\n\nÀ très bientôt !");
        } else {
            showAlert("Erreur lors de l'envoi de l'email.");
        }
    });
