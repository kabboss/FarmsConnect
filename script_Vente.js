document.getElementById('vente-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Récupération de la localisation du vendeur
    navigator.geolocation.getCurrentPosition(function(position) {
        const animal = {
            categorie: document.getElementById('categorie').value,
            nom: document.getElementById('nom-animal').value,
            nombre: document.getElementById('nombre').value,
            poids: document.getElementById('poids').value,
            prix: document.getElementById('prix').value,
            images: [],
            contactPrincipal: document.getElementById('contact-principal').value,
            contactSecondaire: document.getElementById('contact-secondaire').value,
            emailVendeur: document.getElementById('email-vendeur').value,
            codeVendeur: 'V' + Date.now(), // Génère un code vendeur unique
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
        };

        const files = document.getElementById('images').files;
        const fileReaders = [];

        if (files.length === 0) {
            showAlert("Veuillez sélectionner au moins une image."); // Vérification si des fichiers sont sélectionnés
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(event) {
                animal.images.push(event.target.result); // Ajout de l'image sous forme de data URL
                if (animal.images.length === files.length) {
                    let annonces = JSON.parse(localStorage.getItem('annonces')) || [];
                    annonces.push(animal);
                    localStorage.setItem('annonces', JSON.stringify(annonces));
                    showAlert("Votre annonce a été ajoutée avec succès ! 🎉");
                }
            };
            reader.readAsDataURL(files[i]);
        }
    }, function(error) {
        showAlert("La localisation est requise pour ajouter une annonce."); // Utilisation de showAlert pour les erreurs
    });
});

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
            showAlert("Votre annonce a été ajoutée avec succès ! 🎉\n\nNous vous informerons dès qu'un utilisateur est intéressé par votre produit. Merci de faire confiance à notre plateforme pour vos transactions !");
        } else {
            showAlert("Erreur lors de l'envoi de l'email."); // Affiche le message d'erreur approprié
        }
    })
    
