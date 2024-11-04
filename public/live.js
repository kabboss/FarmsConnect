const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // URL du serveur Heroku

let isLive = false;
let isAdmin = false; // À utiliser pour vérifier si FarmsConnect est connecté

// Fonction pour démarrer le live - Accès limité à FarmsConnect
function startLive() {
    if (!isAdmin) {
        alert("Seul FarmsConnect peut démarrer le live.");
        return;
    }
    socket.emit('startLive');
}

// Fonction pour rejoindre le live
function joinLive() {
    socket.emit('joinLive');
}

// Fonction pour terminer le live
function endLive() {
    if (!isAdmin) {
        alert("Seul FarmsConnect peut terminer le live.");
        return;
    }
    socket.emit('endLive');
}

// Recevoir les événements du serveur
socket.on('liveStarted', () => {
    isLive = true;
    document.getElementById('video-stream').style.display = 'block';
    document.getElementById('messages').innerHTML += `<p><strong>Le live a commencé.</strong></p>`;
});

socket.on('liveEnded', () => {
    isLive = false;
    document.getElementById('video-stream').style.display = 'none';
    document.getElementById('messages').innerHTML += `<p><strong>Le live est terminé.</strong></p>`;
});

// Envoie et affichage des messages
function sendMessage(event) {
    if (event.key === 'Enter') {
        const message = document.getElementById('message-input').value;
        if (message) {
            socket.emit('sendMessage', message);
            document.getElementById('message-input').value = '';
        }
    }
}

socket.on('receiveMessage', (message) => {
    document.getElementById('messages').innerHTML += `<p>${message}</p>`;
});
