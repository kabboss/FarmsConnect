const socket = io();
let peerConnection;
const video = document.getElementById('liveVideo');
const configuration = { 
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Admin : Démarrer le flux vidéo
document.getElementById('startAdminStream').onclick = async () => {
    const password = document.getElementById('adminPassword').value;
    socket.emit('adminStartStream', password);
};

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

        // Ajout de chaque piste au stream
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Gestion des événements de la connexion ICE
        peerConnection.oniceconnectionstatechange = () => {
            console.log('État de la connexion ICE:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                console.log('La connexion ICE a échoué ou est déconnectée');
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Offre envoyée:', offer);

        socket.emit('startStream', offer);

        // Recevoir l'answer de l'utilisateur
        socket.on('answer', async (answer) => {
            console.log('Réponse reçue:', answer);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

    } catch (error) {
        console.error('Erreur de streaming:', error);
        alert("Erreur lors de l'accès à la caméra/microphone.");
    }
}

// Arrêter le flux côté admin
document.getElementById('stopAdminStream').onclick = () => {
    socket.emit('stopStream');
    stopStreaming();
};

function stopStreaming() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    document.getElementById('status').textContent = 'Live terminé';
}

// Utilisateur : Réception du flux
socket.on('offer', async (offer) => {
    console.log('Offre reçue par l’utilisateur:', offer);

    try {
        peerConnection = new RTCPeerConnection(configuration);

        peerConnection.ontrack = (event) => {
            console.log('Piste ajoutée au flux');
            video.srcObject = event.streams[0];
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('Réponse envoyée:', answer);
        socket.emit('answer', answer);

    } catch (error) {
        console.error('Erreur de connexion au flux:', error);
    }
});

// Mise à jour de l'état du flux
socket.on('streamStatus', (status) => {
    document.getElementById('status').textContent = status ? 'Live en cours' : 'Le live est terminé';
    if (!status && video.srcObject) {
        video.srcObject = null;
    }
});
