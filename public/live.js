const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // URL du serveur Heroku

let isLive = false;
let userRole = ''; // 'admin' ou 'user'
let userStream = null;
const maxParticipants = 3;
let participants = []; // Stocker les participants autorisés

// Fonction pour démarrer le live avec code Admin
function startLive() {
    const adminCode = document.getElementById('admin-code').value;
    if (adminCode === 'ka23bo23re23') {
        userRole = 'admin';
        socket.emit('startLive');
    } else {
        alert("Code Admin incorrect !");
    }
}

// Fonction pour rejoindre le live
function joinLive() {
    const userCode = document.getElementById('user-code').value;
    if (userCode === 'user2323') {
        userRole = 'user';
        socket.emit('joinLive');
        document.getElementById('chat-section').style.display = 'block'; // Afficher la section de chat
        document.getElementById('request-section').style.display = 'block'; // Afficher la section des demandes
    } else {
        alert("Code utilisateur incorrect !");
    }
}

// Fonction pour terminer le live
function endLive() {
    socket.emit('endLive');
}

// Recevoir les événements du serveur
socket.on('liveStarted', () => {
    isLive = true;
    startStreaming(); // Démarrer le streaming
    document.getElementById('messages').innerHTML += `<p><strong>Le live a commencé.</strong></p>`;
});

socket.on('liveEnded', () => {
    isLive = false;
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
            userStream = stream;
            socket.emit('newParticipant', stream); // Notifier le serveur d'un nouveau participant
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

// Gérer les demandes pour rejoindre le live
socket.on('requestToJoin', (userId) => {
    document.getElementById('requests').innerHTML += `<div>${userId} souhaite rejoindre le live <button onclick="authorizeUser('${userId}')">Autoriser</button></div>`;
});

// Autoriser un utilisateur à rejoindre le live
function authorizeUser(userId) {
    if (participants.length < maxParticipants) {
        socket.emit('authorizeUser', userId);
        participants.push(userId);
    } else {
        alert("Maximum de participants atteint !");
    }
}

// Recevoir la vidéo des participants
socket.on('userAuthorized', (stream) => {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.style.width = '30%';
    videoElement.style.margin = '0 5px';
    document.getElementById('participants').appendChild(videoElement);
});
