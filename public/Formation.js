const socket = io();
let peerConnection;
const video = document.getElementById('liveVideo');
const configuration = { 
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Admin : Démarrer le stream
document.getElementById('startAdminStream').onclick = async () => {
    const password = document.getElementById('adminPassword').value;
    socket.emit('adminStartStream', password);
};

// Authentification Admin
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

// Fonction de streaming de l'admin
async function startStreaming() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        video.srcObject = stream;

        peerConnection = new RTCPeerConnection(configuration);
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('startStream', offer);

        // Recevoir l'answer de l'utilisateur
        socket.on('answer', async (answer) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

    } catch (error) {
        console.error('Erreur de streaming:', error);
        alert("Erreur lors de l'accès à la caméra/microphone.");
    }
}

// Arrêter le stream côté admin
document.getElementById('stopAdminStream').onclick = () => {
    socket.emit('stopStream');
    stopStreaming();
};

function stopStreaming() {
    video.srcObject = null;
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    document.getElementById('status').textContent = 'Live terminé';
}

// Utilisateur : Réception du stream
socket.on('offer', async (offer) => {
    try {
        peerConnection = new RTCPeerConnection(configuration);

        peerConnection.ontrack = (event) => {
            video.srcObject = event.streams[0];
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', answer);

    } catch (error) {
        console.error('Erreur de connexion au flux:', error);
    }
});

// Mise à jour de l'état de streaming
socket.on('streamStatus', (status) => {
    document.getElementById('status').textContent = status ? 'Live en cours' : 'Le live est terminé';
    if (!status && video.srcObject) {
        video.srcObject = null;
    }
});
