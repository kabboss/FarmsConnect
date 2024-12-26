document.getElementById('vente-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Calcul des prix et commission
    const prixUnitaire = parseFloat(document.getElementById('prix').value);
    const commission = prixUnitaire * 0.04;
    const prixFinal = prixUnitaire + commission;

    // Générer un numéro unique pour l'annonce
    const numeroAnnonce = 'Annonce' + Date.now(); // Utilisation du timestamp pour générer un identifiant unique

    // Création de l'objet animal avec le numéro unique
    const animal = {
        numeroAnnonce: numeroAnnonce,  // Ajout du numéro unique à l'annonce
        categorie: document.getElementById('categorie').value,
        nombre: document.getElementById('nombre').value,
        poids: document.getElementById('poids').value,
        prix: prixUnitaire,
        prixFinal: prixFinal.toFixed(2),
        images: [],
        contactPrincipal: document.getElementById('contact-principal').value,
        contactSecondaire: document.getElementById('contact-secondaire').value,
        emailVendeur: document.getElementById('email-vendeur').value,
        codeVendeur: 'V' + Date.now(),
        location: null // La localisation sera ajoutée ici
    };

    // Vérifier les permissions pour l'accès à la localisation via Cordova
    checkPermissions(animal);
});

// Fonction pour vérifier les permissions avec Cordova
function checkPermissions(animal) {
    const permissions = cordova.plugins.permissions;

    permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
        if (!status.hasPermission) {
            // Demander la permission si elle n'est pas accordée
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, 
                function () {
                    console.log("Permission de localisation accordée !");
                    handleLocation(animal); // Appeler la fonction de localisation
                }, 
                function () {
                    console.error("Permission de localisation refusée.");
                    alert("L'application a besoin de la localisation pour fonctionner correctement.");
                }
            );
        } else {
            // Si la permission est déjà accordée
            handleLocation(animal);
        }
    }, function (error) {
        console.error("Erreur lors de la vérification des permissions :", error);
    });
}

// Fonction pour gérer la localisation
function handleLocation(animal) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // Ajouter la localisation à l'objet animal
                animal.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                // Envoyer les données après obtention de la localisation
                sendData(animal);
            },
            function (error) {
                // Gestion des erreurs de géolocalisation
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        showAlert("❌ Permission de localisation refusée.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showAlert("❌ Position non disponible.");
                        break;
                    case error.TIMEOUT:
                        showAlert("❌ Temps d'attente dépassé.");
                        break;
                    default:
                        showAlert("❌ Erreur inconnue lors de la localisation.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        showAlert("❌ La géolocalisation n'est pas supportée par votre appareil.");
    }
}

// Fonction pour envoyer les données de l'annonce
function sendData(animal) {
    const files = document.getElementById('images').files;
    if (files.length === 0) {
        showAlert("Veuillez sélectionner au moins une image.");
        return;
    }

    // Convertir les images en base64
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

        // Envoi des données vers l'API
        fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(animal)
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

                // Afficher l'alerte après envoi réussi
                showAlert("Annonce envoyée avec succès !");

                // Recharger la page après 4 secondes
                setTimeout(() => location.reload(), 4000);
            })
            .catch(error => {
                showAlert("Erreur lors de l'envoi : " + error.message);
            });
    });
}

// Fonction pour afficher un message d'alerte
function showAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");

    alertMessage.textContent = message;
    alertBox.classList.add("visible");

    setTimeout(() => closeAlert(), 10000); // L'alerte se ferme après 10 secondes
}

// Fonction pour fermer le message d'alerte
function closeAlert() {
    const alertBox = document.getElementById("customAlert");
    alertBox.classList.remove("visible");
}
