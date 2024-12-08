document.getElementById('vente-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const prixUnitaire = parseFloat(document.getElementById('prix').value);
    const commission = prixUnitaire * 0.04;
    const fraisLivraison = 650;
    const prixFinal = prixUnitaire + commission + fraisLivraison;

    // Fonction pour générer un identifiant unique pour le vendeur
    const generateVendeur = (email, contactPrincipal) => {
        return 'V' + btoa(email + contactPrincipal); // Encodage Base64 simplifié
    };

    // Création de l'objet `animal`
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
        codeVendeur: generateVendeur(
            document.getElementById('email-vendeur').value,
            document.getElementById('contact-principal').value
        ),
    };

    console.log(animal);

    // Vérification de la sélection d'au moins une image
    const files = document.getElementById('images').files;
    if (files.length === 0) {
        showAlert("Veuillez sélectionner au moins une image.");
        return;
    }

    // Lire les images en tant que base64
    const fileReaders = Array.from(files).map((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    try {
        // Charger les images dans l'objet `animal`
        animal.images = await Promise.all(fileReaders);

        // Vérifier la limite d'annonces pour ce vendeur
        const checkLimitResponse = await fetch(
            `https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces/check-limit`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendeurId: animal.codeVendeur }),
            }
        );

        if (!checkLimitResponse.ok) {
            const errorMessage = await checkLimitResponse.text();
            throw new Error(`Erreur limite d'annonces : ${errorMessage}`);
        }

        // Vérifier si l'annonce est dupliquée
        const checkDuplicateResponse = await fetch(
            `https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces/check-duplicate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(animal),
            }
        );

        if (!checkDuplicateResponse.ok) {
            const errorMessage = await checkDuplicateResponse.text();
            throw new Error(`Erreur annonce dupliquée : ${errorMessage}`);
        }

        // Envoyer les données de l'annonce au serveur
        const response = await fetch(
            'https://farmsconnect-b084ddb02391.herokuapp.com/api/annonces',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(animal),
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erreur HTTP : ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        showAlert(data.message);
    } catch (error) {
        // Afficher les erreurs
        showAlert("Erreur lors de l'ajout de l'annonce : " + error.message);
    }
});

function showAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');

    alertMessage.textContent = message;
    alertBox.classList.add('visible'); // Ajoute la classe pour afficher l'alerte

    // Masque automatiquement après 5 secondes
    setTimeout(() => closeAlert(), 10000);
}

function closeAlert() {
    const alertBox = document.getElementById('customAlert');
    alertBox.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const openModalButton = document.querySelector('.open-modal-button');
    const closeModalButton = modal.querySelector('.close-button');

    // Ouvrir la fenêtre modale
    openModalButton.addEventListener('click', (event) => {
        event.preventDefault(); // Empêche la soumission du formulaire si le bouton est dans un formulaire
        modal.classList.add('visible'); // Affiche la modale
    });

    // Fermer la fenêtre modale
    closeModalButton.addEventListener('click', () => {
        modal.classList.remove('visible'); // Cache la modale
    });

    // Fermer la fenêtre modale en cliquant à l'extérieur
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('visible'); // Cache la modale si on clique à l'extérieur
        }
    });
});
