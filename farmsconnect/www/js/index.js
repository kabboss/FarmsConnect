// Fonction globale pour ouvrir un lien dans le navigateur externe
function openInBrowser(url) {
    if (cordova && cordova.InAppBrowser) {
        cordova.InAppBrowser.open(url, '_system'); // Ouvre le lien dans le navigateur externe
    } else {
        alert("Erreur : InAppBrowser non disponible.");
    }
}

// Ajoute l'écouteur d'événement deviceready
document.addEventListener('deviceready', function() {
    console.log("Appareil prêt.");
}, false);
