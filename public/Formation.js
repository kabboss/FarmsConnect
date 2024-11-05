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
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('stopAdminStream').style.display = 'block';
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

// Arrêter le streaming
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
socket.on('stream', (track) => {
    const video = document.getElementById('liveVideo');
    video.srcObject = new MediaStream([track]);
    document.getElementById('status').textContent = 'Live en cours';
});

// Gestion de l'état du live pour les utilisateurs
socket.on('streamStatus', (status) => {
    if (!status) {
        document.getElementById('status').textContent = 'Le live est terminé.';
    } else {
        socket.emit('requestStream');  // Demande le flux en cas de reconnection
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
