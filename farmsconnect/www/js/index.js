var app = {
    // Appelée au démarrage de l'application
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // Appelée lorsque l'événement deviceready est déclenché
    onDeviceReady: function () {
        this.receivedEvent('deviceready');

        // Ici, vous placez votre code pour utiliser les plugins, comme Native Page Transitions
        window.plugins.nativepagetransitions.slide({
            direction: 'left',
            duration: 500,
            iosdelay: 50,
            androiddelay: 100,
        }, function (msg) {
            console.log('Transition réussie : ', msg);
        }, function (err) {
            console.error('Erreur lors de la transition : ', err);
        });
    },

    receivedEvent: function (id) {
        console.log('Événement reçu : ' + id);
    }
};

app.initialize();



document.addEventListener('deviceready', function () {
    // Exemple : Animation lors du passage d'un écran à un autre
    window.plugins.nativepagetransitions.slide({
        duration: 500,        // Durée de la transition en millisecondes
        iosdelay: 50,         // Délai spécifique pour iOS
        androiddelay: 100,    // Délai spécifique pour Android
    }, function (msg) {
        console.log('Transition réussie : ', msg);
    }, function (err) {
        console.error('Erreur lors de la transition : ', err);
    });
});


document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 3000); // Durée de l'animation.
});
