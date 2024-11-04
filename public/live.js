const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // URL du serveur Heroku

let isLive = false;

// Fonction pour démarrer le live avec code Admin
function startLive() {
    const adminCode = document.getElementById('admin-code').value;
    if (adminCode === 'ka23bo23re23') {
        socket.emit('startLive');
    } else {
        alert("Code Admin incorrect !");
    }
}

// Fonction pour rejoindre le live
function joinLive() {
    socket.emit('joinLive');
    document.getElementById('chat-section').style.display = 'block'; // Afficher la section de chat
}

// Fonction pour terminer le live
function endLive() {
    socket.emit('endLive');
}

// Recevoir les événements du serveur
socket.on('liveStarted', () => {
    isLive = true;
    document.getElementById('video-stream').style.display = 'block'; // Afficher le flux vidéo
    startStreaming(); // Démarrer le streaming
    document.getElementById('messages').innerHTML += `<p><strong>Le live a commencé.</strong></p>`;
});

socket.on('liveEnded', () => {
    isLive = false;
    document.getElementById('video-stream').style.display = 'none'; // Cacher le flux vidéo
    stopStreaming(); // Arrêter le streaming
    document.getElementById('messages').innerHTML += `<p><strong>Le live est terminé.</strong></p>`;
});

// Gestion des flux vidéo
function startStreaming() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            const video = document.getElementById('video-stream');
            video.srcObject = stream;
            video.play();
        })
        .catch((error) => console.error("Erreur lors de l'accès à la caméra : ", error));
}

function stopStreaming() {
    const video = document.getElementById('video-stream');
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
}

// Envoie et affichage des messages
function sendMessage(event) {
    if (event.key === 'Enter') {
        sendMessageToServer();
    }
}

function sendMessageButton() {
    sendMessageToServer();
}

function sendMessageToServer() {
    const message = document.getElementById('message-input').value;
    if (message) {
        socket.emit('sendMessage', message);
        document.getElementById('message-input').value = '';
    }
}

socket.on('receiveMessage', (message) => {
    document.getElementById('messages').innerHTML += `<p>${message}</p>`;
});
