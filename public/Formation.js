const socket = io();

const liveVideo = document.getElementById('liveVideo');
const startLiveButton = document.getElementById('startLive');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendMessageButton = document.getElementById('sendMessage');
const questionInput = document.getElementById('questionInput');
const askQuestionButton = document.getElementById('askQuestion');
const qaList = document.getElementById('qaList');
const reactionButtons = document.querySelectorAll('.reaction');

// Fonction pour démarrer le flux vidéo
startLiveButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    liveVideo.srcObject = stream;

    stream.getTracks().forEach(track => socket.emit('startStream', track));
    startLiveButton.disabled = true;
});

// Fonction pour envoyer un message dans le chat
sendMessageButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        chatInput.value = '';
    }
});

// Afficher les messages du chat
socket.on('chatMessage', (msg) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Poser une question
askQuestionButton.addEventListener('click', () => {
    const question = questionInput.value.trim();
    if (question) {
        socket.emit('question', question);
        questionInput.value = '';
    }
});

// Afficher les questions
socket.on('question', (question) => {
    const li = document.createElement('li');
    li.textContent = question;
    qaList.appendChild(li);
});

// Réactions en direct
reactionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reaction = button.getAttribute('data-reaction');
        socket.emit('reaction', reaction);
    });
});

socket.on('reaction', (reaction) => {
    alert(`Nouvelle réaction : ${reaction}`);
});
