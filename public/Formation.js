// Socket.io côté client
const socket = io();

document.getElementById('send-btn').addEventListener('click', () => {
    const msg = document.getElementById('chat-input').value;
    socket.emit('chat message', msg);
    document.getElementById('chat-input').value = ''; // Clear input
});

socket.on('chat message', (msg) => {
    const chatBox = document.getElementById('chat-box');
    const messageElem = document.createElement('div');
    messageElem.textContent = msg;
    chatBox.appendChild(messageElem);
});
