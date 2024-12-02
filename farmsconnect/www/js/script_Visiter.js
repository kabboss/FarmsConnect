document.addEventListener('DOMContentLoaded', function() {
    const animalsList = document.getElementById('animals-list');

    // Récupérer les annonces
    fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces')
    .then(response => response.json())
    .then(annonces => {
        annonces.forEach(animal => {
            const animalCard = document.createElement('div');
            animalCard.classList.add('animal-card');
            
            // Sélection de l'image principale
            const mainImage = animal.images[0];

            // Création du bouton "Voir plus"
            const seeMoreButton = animal.images.length > 1 ? 
                `<button class="see-more-button" data-animal='${JSON.stringify(animal)}'>Voir plus</button>` : '';

            // Construction du contenu de la carte de l'animal
            animalCard.innerHTML = `
                <h3>(${animal.categorie})</h3>
                <p>Nombre : ${animal.nombre}</p>
                <p>Poids par animal : ${animal.poids} kg</p>
                <p>Prix unitaire : ${animal.prix} FCFA</p>
                <p>Code du vendeur : ${animal.codeVendeur}</p>
                <div class="images-section">
                    <img src="${mainImage}" alt="Image de l'animal" class="main-image"/>
                    <div class="additional-images hidden">
                        ${animal.images.slice(1).map(img => `<img src="${img}" alt="Image supplémentaire" class="additional-image" />`).join('')}
                    </div>
                    ${seeMoreButton}
                </div>
                <button class="buy-button" data-animal='${JSON.stringify(animal)}'>Acheter ce produit</button>
            `;

            animalsList.appendChild(animalCard);
        });
        

        document.querySelectorAll('.see-more-button').forEach(button => {
            button.addEventListener('click', function() {
                const animal = JSON.parse(this.getAttribute('data-animal'));
                const additionalImages = this.previousElementSibling; // Sélectionner la section d'images supplémentaires
                additionalImages.classList.toggle('hidden');
                this.textContent = additionalImages.classList.contains('hidden') ? 'Voir plus' : 'Voir moins';
            });
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
    alertBox.classList.add("visible");
}

function closeAlert() {
    const alertBox = document.getElementById("customAlert");
    alertBox.classList.remove("visible");
    alertBox.classList.add("hidden");
}





// Sélectionne les éléments
const modalVisitor = document.getElementById('modal-visitor');
const openModalButtonVisitor = document.querySelector('.open-modal-button');
const closeButtonVisitor = document.querySelector('.close-button');

// Ouvre la fenêtre modale pour les visiteurs
openModalButtonVisitor.addEventListener('click', function() {
    modalVisitor.classList.add('visible'); // Ajoute la classe 'visible' pour afficher la modale
});

// Ferme la fenêtre modale pour les visiteurs
closeButtonVisitor.addEventListener('click', function() {
    modalVisitor.classList.remove('visible'); // Retire la classe 'visible' pour masquer la modale
});

// Ferme la fenêtre modale si l'utilisateur clique en dehors de celle-ci
window.addEventListener('click', function(event) {
    if (event.target === modalVisitor) {
        modalVisitor.classList.remove('visible'); // Masque la modale si on clique en dehors
    }
});


