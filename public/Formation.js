const socket = io();
let isStreaming = false;

// Authentification administrateur
document.getElementById('startAdminStream').onclick = () => {
    const password = document.getElementById('adminPassword').value;
    socket.emit('adminStartStream', password);
};

// Réponse d'authentification de l'administrateur
socket.on('adminAuthenticated', (authenticated) => {
    if (authenticated) {
        startStreaming();
        document.getElementById('status').textContent = 'Live démarré';
    } else {
        alert('Mot de passe incorrect');
    }
});

// Démarrer le streaming en tant qu’administrateur
function startStreaming() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            const video = document.getElementById('liveVideo');
            video.srcObject = stream;

            const track = stream.getVideoTracks()[0];
            socket.emit('startStream', track);
            isStreaming = true;
        })
        .catch((error) => {
            console.error('Erreur lors du démarrage du flux:', error);
        });
}

// Recevoir et afficher le flux vidéo pour les utilisateurs
socket.on('stream', (track) => {
    if (!isStreaming) {
        const video = document.getElementById('liveVideo');
        video.srcObject = new MediaStream([track]);
        document.getElementById('status').textContent = 'Live en cours';
    }
});

// Chat en direct
document.getElementById('sendChat').onclick = () => {
    const message = document.getElementById('chatInput').value;
    if (message.trim()) {
        socket.emit('chatMessage', message);
        document.getElementById('chatInput').value = '';
    }
};

// Afficher les messages de chat
socket.on('chatMessage', (msg) => {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('p');
    messageElement.textContent = msg;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
