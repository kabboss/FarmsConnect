document.getElementById('uploadButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('videoUpload');
    const accessCodeInput = document.getElementById('accessCode');
    const accessCode = accessCodeInput.value.trim();

    if (accessCode !== 'ka23bo23re23') {
        alert("Code d'accès incorrect !");
        return;
    }

    if (fileInput.files.length === 0) {
        alert("Veuillez sélectionner un fichier vidéo !");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('video', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            loadVideoList();
        } else {
            alert("Échec de l'importation de la vidéo !");
        }
    } catch (error) {
        console.error('Erreur lors de l\'importation de la vidéo :', error);
    }
});

async function loadVideoList() {
    const response = await fetch('/videos');
    const videos = await response.json();
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = '';

    videos.forEach(video => {
        const li = document.createElement('li');
        li.className = 'videoItem';
        li.textContent = video.filename;
        const deleteButton = document.createElement('button');
        deleteButton.className = 'deleteButton';
        deleteButton.textContent = 'Supprimer';
        deleteButton.onclick = () => deleteVideo(video.filename);
        li.appendChild(deleteButton);
        videoList.appendChild(li);
    });
}

async function deleteVideo(filename) {
    const accessCode = prompt("Entrez le code d'accès pour supprimer la vidéo :");
    if (accessCode !== 'ka23bo23re23') {
        alert("Code d'accès incorrect !");
        return;
    }

    const response = await fetch(`/delete/${encodeURIComponent(filename)}`, { method: 'DELETE' });

    if (response.ok) {
        loadVideoList();
    } else {
        alert("Échec de la suppression de la vidéo !");
    }
}

// Charger la liste des vidéos au démarrage
loadVideoList();
