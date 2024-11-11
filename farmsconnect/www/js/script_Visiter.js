document.addEventListener('DOMContentLoaded', function() {
    const animalsList = document.getElementById('animals-list');

    // Récupérer les annonces
    fetch('/api/annonces')
        .then(response => response.json())
        .then(annonces => {
            annonces.forEach(animal => {
                // Traitement des annonces sans géolocalisation
                const animalCard = document.createElement('div');
                animalCard.classList.add('animal-card');
                animalCard.innerHTML = `
                    <h3>${animal.nom} (${animal.categorie})</h3>
                    <p>Nombre : ${animal.nombre}</p>
                    <p>Poids par animal : ${animal.poids} kg</p>
                    <p>Prix unitaire : ${animal.prix} FCFA</p>
                    <p>Code du vendeur : ${animal.codeVendeur}</p>
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
