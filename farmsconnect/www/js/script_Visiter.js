document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour récupérer les annonces depuis l'API
    function fetchAnnonces() {
        fetch('https://farmsconnect-b084ddb02391.herokuapp.com/annonces')
            .then(response => response.json())
            .then(data => {
                displayAnnonces(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des annonces:', error);
            });
    }

    // Fonction pour afficher les annonces sur la page
    function displayAnnonces(annonces) {
        const annoncesContainer = document.getElementById('annonces-container');
        annoncesContainer.innerHTML = ''; // Réinitialiser le contenu

        annonces.forEach(animal => {
            const div = document.createElement('div');
            div.classList.add('annonce');

            div.innerHTML = `
                <h3>${animal.nom}</h3>
                <p>Catégorie : ${animal.categorie}</p>
                <p>Prix : ${animal.prix} FCFA</p>
                <p>Distance : ${animal.distance} km</p>
                <button onclick="handlePurchase('${animal.id}')">Acheter</button>
            `;

            annoncesContainer.appendChild(div);
        });
    }

    // Fonction pour calculer la distance entre deux points géographiques
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    // Fonction pour gérer l'achat
    function handlePurchase(animalId) {
        const animal = getAnimalById(animalId); // Supposons qu'une fonction existe pour récupérer l'animal par son ID
        const visitorInfo = {
            username: prompt('Entrez votre nom d’utilisateur :').trim(),
            contact: prompt('Entrez votre numéro de contact :').trim(),
            email: prompt('Entrez votre e-mail :').trim(),
            quantity: prompt('Combien d\'unités souhaitez-vous acheter ?').trim(),
            budget: prompt('Quel est votre budget pour l\'achat d\'une unité ?').trim(),
            buyerLocation: {} // Stocke la localisation de l'acheteur
        };

        if (!visitorInfo.username || !visitorInfo.contact || !visitorInfo.email || !visitorInfo.quantity || !visitorInfo.budget) {
            alert('Veuillez remplir toutes les informations demandées.');
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                visitorInfo.buyerLocation.latitude = position.coords.latitude;
                visitorInfo.buyerLocation.longitude = position.coords.longitude;

                // Calculer la distance entre le vendeur et l'acheteur
                const distance = calculateDistance(animal.location.latitude, animal.location.longitude, visitorInfo.buyerLocation.latitude, visitorInfo.buyerLocation.longitude);

                // Ajouter la distance à l'animal et envoyer à l'API
                animal.distance = distance.toFixed(2); // Ajouter la distance calculée à l'animal

                // Enregistrer l'achat (via API)
                savePurchase(animal, visitorInfo);
            }, function(error) {
                alert("Erreur lors de la récupération de la localisation.");
            });
        } else {
            alert("La géolocalisation n'est pas disponible sur votre appareil.");
        }
    }

    // Fonction pour envoyer les informations d'achat à l'API
    function savePurchase(animal, visitorInfo) {
        const purchaseData = {
            animalId: animal.id,
            buyerUsername: visitorInfo.username,
            buyerContact: visitorInfo.contact,
            buyerEmail: visitorInfo.email,
            quantity: visitorInfo.quantity,
            buyerLocation: visitorInfo.buyerLocation,
            distance: animal.distance
        };

        fetch('https://farmsconnect-b084ddb02391.herokuapp.com/achats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Achat enregistré avec succès!');
        })
        .catch(error => {
            console.error('Erreur lors de l\'enregistrement de l\'achat:', error);
        });
    }

    // Appel de la fonction pour afficher les annonces au chargement
    fetchAnnonces();
});
