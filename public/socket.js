const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // Établir la connexion

socket.on('connect', () => {
    console.log('Connecté au serveur Socket.IO.');
});

socket.on('disconnect', () => {
    console.log('Déconnecté du serveur.');
});
