function openInBrowser(url) {
    var ref = cordova.InAppBrowser.open(url, '_system'); // Ouvre le lien dans le navigateur externe (comme Chrome)
}

// Exemple d'utilisation de la fonction
openInBrowser("https://farmsconnect-b084ddb02391.herokuapp.com");
