document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (password !== 'ka23bo23re23') {
        alert('Mot de passe incorrect!');
        return;
    }

    const formData = new FormData();
    const videoFile = document.querySelector('input[name="video"]').files[0];
    const audioFile = document.querySelector('input[name="audio"]').files[0];

    formData.append('video', videoFile);
    formData.append('audio', audioFile);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Erreur de téléchargement:', error);
    }
});

// Charger les commentaires
async function loadComments() {
    const response = await fetch('/comments');
    const comments = await response.json();
    const commentsContainer = document.getElementById('comments');
    commentsContainer.innerHTML = '';
    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<strong>${comment.username}</strong>: ${comment.text} <em>${new Date(comment.date).toLocaleString()}</em>`;
        commentsContainer.appendChild(div);
    });
}

// Envoyer un commentaire
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const text = document.getElementById('commentText').value;

    const response = await fetch('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, text })
    });

    const newComment = await response.json();
    loadComments(); // Recharger les commentaires
    document.getElementById('commentForm').reset(); // Réinitialiser le formulaire
});

// Charger les commentaires au démarrage
loadComments();
