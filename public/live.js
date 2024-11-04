const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // URL du serveur Heroku

let isLive = false;

// Fonction pour démarrer le live avec vérification du code Admin
function startLive() {
    const adminCode = prompt("Veuillez entrer le code Admin pour démarrer le live:");
    if (adminCode === "ka23bo23re23") {
        socket.emit('startLive');
    } else {
        alert("Code Admin incorrect. Vous n'êtes pas autorisé à démarrer le live.");
    }
}

// Fonction pour rejoindre le live
function joinLive() {
    socket.emit('joinLive');
}

// Fonction pour terminer le live
function endLive() {
    const adminCode = prompt("Veuillez entrer le code Admin pour terminer le live:");
    if (adminCode === "ka23bo23re23") {
        socket.emit('endLive');
    } else {
        alert("Code Admin incorrect. Vous n'êtes pas autorisé à terminer le live.");
    }
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
