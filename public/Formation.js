// Récupération et affichage des fichiers
async function loadFiles() {
    const response = await fetch('/files');
    const files = await response.json();

    const filesList = document.getElementById('filesList');
    filesList.innerHTML = files.map(file => {
        return `
            <div class="file-item">
                <p>${file.filename}</p>
                ${file.type.includes('video') ? `<video controls src="/${file.path}"></video>` : `<audio controls src="/${file.path}"></audio>`}
            </div>
        `;
    }).join('');
}

// Gestion de l'upload de fichier
document.getElementById('uploadForm').onsubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const codeInput = document.getElementById('codeInput');
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('code', codeInput.value);

    await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    loadFiles();
};

// Récupération et affichage des commentaires
async function loadComments() {
    const response = await fetch('/comments');
    const comments = await response.json();

    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = comments.map(comment => {
        return `<div class="comment"><strong>${comment.username}</strong>: ${comment.content}</div>`;
    }).join('');
}

// Gestion de l'ajout de commentaire
document.getElementById('commentForm').onsubmit = async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('usernameInput');
    const contentInput = document.getElementById('contentInput');

    await fetch('/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: usernameInput.value,
            content: contentInput.value
        })
    });

    usernameInput.value = '';
    contentInput.value = '';
    loadComments();
};

// Charger les fichiers et les commentaires au chargement de la page
loadFiles();
loadComments();


document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const codeInput = document.getElementById('codeInput');

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('code', codeInput.value);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'upload :", error);
    }
});

async function fetchFormations() {
    const response = await fetch('/formations');
    const formations = await response.json();

    const container = document.getElementById('formationContainer');
    container.innerHTML = '';

    formations.forEach(formation => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${formation.title}</h3>
            <video controls src="/${formation.filePath}" width="300"></video>
        `;
        container.appendChild(div);
    });
}

fetchFormations();
