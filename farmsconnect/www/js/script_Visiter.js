// Fonction pour traiter la soumission du formulaire d'achat
document.getElementById('acheter-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche l'envoi par défaut du formulaire

    // Récupération des informations de l'acheteur
    const acheteur = {
        nomAcheteur: document.getElementById('nom-acheteur').value,
        emailAcheteur: document.getElementById('email-acheteur').value,
        contactAcheteur: document.getElementById('contact-acheteur').value,
        messageAcheteur: document.getElementById('message-acheteur').value
    };

    // Récupération de la position géographique de l'acheteur
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            // Récupérer les coordonnées du vendeur depuis le localStorage
            const vendeurLatitude = window.localStorage.getItem('latitude');
            const vendeurLongitude = window.localStorage.getItem('longitude');

            if (vendeurLatitude && vendeurLongitude) {
                // Calcul de la distance entre l'acheteur et le vendeur
                const distance = await calculateDistance(latitude, longitude, vendeurLatitude, vendeurLongitude);

                // Création du contenu du message
                const emailContent = `
                    Un acheteur a manifesté son intérêt pour votre animal !
                    Nom: ${acheteur.nomAcheteur}
                    Email: ${acheteur.emailAcheteur}
                    Contact: ${acheteur.contactAcheteur}
                    Message: ${acheteur.messageAcheteur}
                    Distance de l'acheteur: ${distance} km
                `;

                try {
                    // Envoi de l'email au vendeur
                    const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ emailContent })
                    });

                    const data = await response.json();
                    if (response.ok) {
                        alert('Votre demande a été envoyée avec succès !');
                        document.getElementById('acheter-form').reset(); // Réinitialise le formulaire
                    } else {
                        alert('Erreur lors de l\'envoi de la demande: ' + data.message);
                    }
                } catch (error) {
                    alert('Erreur lors de la communication avec le serveur: ' + error.message);
                }
            } else {
                alert('Les coordonnées du vendeur ne sont pas disponibles.');
            }
        }, (error) => {
            alert('Impossible de récupérer la géolocalisation: ' + error.message);
        });
    } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
});

// Fonction pour calculer la distance entre deux points (latitude, longitude)
async function calculateDistance(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(2); // Retourne la distance en km avec 2 décimales
}
