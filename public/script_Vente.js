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
            codeVendeur: 'V' + Date.now(),
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
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
                body: JSON.stringify(animal)
            })
            .then(response => response.json())
            .then(data => showAlert(data.message))
            .catch(error => showAlert("Erreur lors de l'ajout de l'annonce : " + error.message));
        });
    }, function(error) {
        showAlert("La localisation est requise pour ajouter une annonce.");
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
