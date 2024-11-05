const socket = io();
let isAdmin = false; // Indique si l'utilisateur est l'admin

// Authentification de l'administrateur
document.getElementById('startAdminStream').onclick = () => {
    const password = document.getElementById('adminPassword').value;
    socket.emit('adminStartStream', password);
};

// Réponse de l'authentification administrateur
socket.on('adminAuthenticated', (authenticated) => {
    if (authenticated) {
        isAdmin = true;
        startStreaming();
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('stopAdminStream').style.display = 'block';
        document.getElementById('status').textContent = 'Live démarré';
    } else {
        alert('Mot de passe incorrect');
    }
});

// Démarrer le streaming pour l'admin
function startStreaming() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            const video = document.getElementById('liveVideo');
            video.srcObject = stream;

            const [videoTrack] = stream.getVideoTracks();
            socket.emit('startStream', videoTrack); // Envoyer le flux au serveur
        })
        .catch((error) => {
            console.error('Erreur lors du démarrage du flux:', error);
        });
}

// Arrêter le live pour l'admin
document.getElementById('stopAdminStream').onclick = () => {
    socket.emit('stopStream');
    stopStreaming();
};

function stopStreaming() {
    const video = document.getElementById('liveVideo');
    video.srcObject = null;
    document.getElementById('status').textContent = 'Live terminé';
}

// Recevoir et afficher le flux vidéo pour les utilisateurs
socket.on('stream', (stream) => {
    const video = document.getElementById('liveVideo');
    video.srcObject = new MediaStream([stream]);
    document.getElementById('status').textContent = 'Live en cours';
});

// Gestion de l'état du live pour les utilisateurs
socket.on('streamStatus', (status) => {
    if (!status) {
        document.getElementById('status').textContent = 'Le live est terminé.';
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
