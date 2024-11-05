const socket = io();
let peerConnection;
const video = document.getElementById('liveVideo');
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Authentification de l'administrateur
document.getElementById('startAdminStream').onclick = async () => {
    const password = document.getElementById('adminPassword').value;
    socket.emit('adminStartStream', password);
};

// Réponse de l'authentification de l'admin
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

// Démarrer le streaming pour l'administrateur
async function startStreaming() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;

    peerConnection = new RTCPeerConnection(configuration);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('startStream', offer);

    socket.on('answer', async (answer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });
}

// Arrêter le streaming pour l'administrateur
document.getElementById('stopAdminStream').onclick = () => {
    socket.emit('stopStream');
    stopStreaming();
};

function stopStreaming() {
    video.srcObject = null;
    document.getElementById('status').textContent = 'Live terminé';
}

// Recevoir et afficher le flux pour les spectateurs
socket.on('offer', async (offer) => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.ontrack = (event) => {
        video.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('answer', answer);
});

// Gérer l'état du live
socket.on('streamStatus', (status) => {
    document.getElementById('status').textContent = status ? 'Live en cours' : 'Le live est terminé';
});
