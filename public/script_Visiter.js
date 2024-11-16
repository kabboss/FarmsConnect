document.addEventListener('DOMContentLoaded', function() {
    const animalsList = document.getElementById('animals-list');

    // Récupérer les annonces
    fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces')
    .then(response => response.json())
    .then(annonces => {
        annonces.forEach(animal => {
            // Suppression de la géolocalisation, donc pas besoin de distance
            const animalCard = document.createElement('div');
            animalCard.classList.add('animal-card');
            animalCard.innerHTML = `
                <h3>(${animal.categorie})</h3>
                <p>Nombre : ${animal.nombre}</p>
                <p>Poids par animal : ${animal.poids} kg</p>
                <p>Prix unitaire : ${animal.prix} FCFA</p>
                <p>Code du vendeur : ${animal.codeVendeur}</p>
                <!-- Suppression de la distance -->
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









// Sélectionne les éléments
const modalVisitor = document.getElementById('modal-visitor');
const openModalButtonVisitor = document.querySelector('.open-modal-button');
const closeButtonVisitor = document.querySelector('.close-button');

// Ouvre la fenêtre modale pour les visiteurs
openModalButtonVisitor.addEventListener('click', function() {
    modalVisitor.classList.add('visible');
});

// Ferme la fenêtre modale pour les visiteurs
closeButtonVisitor.addEventListener('click', function() {
    modalVisitor.classList.remove('visible');
});

// Ferme la fenêtre modale si l'utilisateur clique en dehors de celle-ci
window.addEventListener('click', function(event) {
    if (event.target === modalVisitor) {
        modalVisitor.classList.remove('visible');
    }
});
