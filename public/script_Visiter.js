document.addEventListener('DOMContentLoaded', function() {
    const animalsList = document.getElementById('animals-list');

    // Fonction pour calculer la distance entre deux points géographiques
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Obtenir la localisation de l'utilisateur et les annonces
    navigator.geolocation.getCurrentPosition(position => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        fetch('/api/annonces')
            .then(response => response.json())
            .then(annonces => {
                annonces.forEach(animal => {
                    if (animal.location) {
                        animal.distance = calculateDistance(
                            userLatitude,
                            userLongitude,
                            animal.location.latitude,
                            animal.location.longitude
                        );
                    } else {
                        animal.distance = Infinity;
                    }
                });

                annonces.sort((a, b) => a.distance - b.distance);

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

                document.querySelectorAll('.buy-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const animal = JSON.parse(this.getAttribute('data-animal'));
                        handlePurchase(animal);
                    });
                });
            })
            .catch(error => showAlert("Erreur lors du chargement des annonces : " + error.message));
    }, function(error) {
        showAlert("La localisation est nécessaire pour trier les annonces par proximité.");
    });
});

// Fonction pour afficher une alerte personnalisée
function showAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    setTimeout(() => closeAlert(), 10000);
}

function closeAlert() {
    document.getElementById("customAlert").classList.add("hidden");
}
