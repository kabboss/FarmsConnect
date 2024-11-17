document.getElementById('vente-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const animal = {
        categorie: document.getElementById('categorie').value,
        nombre: document.getElementById('nombre').value,
        poids: document.getElementById('poids').value,
        prix: document.getElementById('prix').value,
        images: [],
        contactPrincipal: document.getElementById('contact-principal').value,
        contactSecondaire: document.getElementById('contact-secondaire').value,
        emailVendeur: document.getElementById('email-vendeur').value,
        codeVendeur: 'V' + Date.now(),
    };

    const files = document.getElementById('images').files;
    if (files.length === 0) {
        showAlert("Veuillez sélectionner au moins une image.");
        return;
    }

    // Lire les images en tant que base64
    const fileReaders = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(fileReaders).then(images => {
        animal.images = images;

        // Envoyer les données de l'annonce au serveur
        fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(animal) // Assurez-vous que 'animal' est bien formé
        })
        .then(response => {
            // Vérifiez si la réponse est réussie
            if (!response.ok) {
                // Si la réponse n'est pas en succès, affichez l'erreur
                return response.text().then(text => {
                    throw new Error(`Erreur HTTP : ${response.status} - ${text}`);
                });
            }
            // Essayez de convertir la réponse en JSON
            return response.json();
        })
        .then(data => {
            // Affichez le message de succès
            showAlert(data.message);
        })
        .catch(error => {
            // Affichez les erreurs
            showAlert("Erreur lors de l'ajout de l'annonce : " + error.message);
        });
    });
});

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








document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const openModalButton = document.querySelector('.open-modal-button');
    const closeModalButton = modal.querySelector('.close-button');

    // Ouvrir la fenêtre modale
    openModalButton.addEventListener('click', () => {
        modal.classList.add('visible');
    });

    // Fermer la fenêtre modale
    closeModalButton.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // Fermer la fenêtre modale en cliquant à l'extérieur
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('visible');
        }
    });
});
