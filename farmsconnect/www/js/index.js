document.addEventListener("deviceready", function () {
    console.log("Appareil prêt.");

    // Vérifier et demander les permissions pour la localisation
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(
        permissions.ACCESS_FINE_LOCATION,
        function (status) {
            if (!status.hasPermission) {
                permissions.requestPermission(
                    permissions.ACCESS_FINE_LOCATION,
                    function () {
                        console.log("Permission de localisation accordée !");
                        obtenirLocalisation();
                    },
                    function () {
                        alert("Permission de localisation refusée !");
                    }
                );
            } else {
                console.log("Permission de localisation déjà accordée.");
                obtenirLocalisation();
            }
        },
        function () {
            console.error("Erreur lors de la vérification des permissions.");
        }
    );

    // Fonction pour ouvrir un lien dans le navigateur externe
    window.openInBrowser = function (url) {
        if (cordova && cordova.InAppBrowser) {
            console.log("Tentative d'ouverture du lien : " + url);
            cordova.InAppBrowser.open(url, "_system"); // Ouvre le lien dans le navigateur externe
        } else {
            console.error("InAppBrowser non disponible.");
            alert("Erreur : InAppBrowser non disponible.");
        }
    };
}, false);

// Fonction pour obtenir la localisation
function obtenirLocalisation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Affiche les coordonnées dans la console
                console.log("Latitude : " + latitude + ", Longitude : " + longitude);
                alert("Votre position actuelle : \nLatitude : " + latitude + "\nLongitude : " + longitude);
            },
            function (error) {
                console.error("Erreur lors de la récupération de la localisation : ", error);
                alert("Impossible d'obtenir votre position. Erreur : " + error.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
    }
}
