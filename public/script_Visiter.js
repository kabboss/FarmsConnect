
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


