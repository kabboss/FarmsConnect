document.getElementById('vente-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const prixUnitaire = parseFloat(document.getElementById('prix').value);
    const commission = prixUnitaire * 0.04;
    const fraisLivraison = 500;
    const prixFinal = prixUnitaire + commission;

    const generateVendeurId = (email, contactPrincipal) => {
        // Générer un identifiant unique basé sur l'email et le numéro de téléphone
        return 'V' + Buffer.from(email + contactPrincipal).toString('hex');
    };

    const animal = {
        categorie: document.getElementById('categorie').value,
        nombre: document.getElementById('nombre').value,
        poids: document.getElementById('poids').value,
        prix: prixUnitaire,
        prixFinal: prixFinal.toFixed(2), // Inclure le prix final calculé
        images: [],
        contactPrincipal: document.getElementById('contact-principal').value,
        contactSecondaire: document.getElementById('contact-secondaire').value,
        emailVendeur: document.getElementById('email-vendeur').value,
        codeVendeur: 'V' + Date.now(),
        location: null // La localisation sera définie ici
    };

    // Vérifier si la localisation est déjà renseignée
    if (!animal.location) {
        // Si la localisation n'est pas renseignée, demander la permission d'utiliser la géolocalisation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                // Une fois la localisation obtenue, on met à jour l'objet animal
                animal.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                // Afficher le message de succès dès que l'utilisateur autorise la géolocalisation
                showAlert("Annonce envoyée avec succès !");

                // Maintenant, on peut envoyer les données
                sendData(animal);

            }, function(error) {
                // Si l'utilisateur refuse ou qu'il y a un problème avec la géolocalisation
                showAlert("Erreur : Impossible d'obtenir votre localisation.");
            });
        } else {
            showAlert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    } else {
        // Si la localisation est déjà renseignée, envoyer les données immédiatement
        sendData(animal);
    }
});

function sendData(animal) {
    console.log(animal);

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
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erreur HTTP : ${response.status} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Annonce envoyée avec succès", data);
            // Recharger la page après un délai de 2 secondes
            setTimeout(() => {
                location.reload();  // Rechargement de la page
            }, 2000);
        })
        .catch(error => {
            showAlert("Erreur lors de l'envoi de l'annonce : " + error.message);
        });
    });
}

function showAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    alertMessage.textContent = message;
    alertBox.classList.add("visible");

    setTimeout(() => closeAlert(), 10000);
}

function closeAlert() {
    const alertBox = document.getElementById("customAlert");
    alertBox.classList.remove("visible");
}
