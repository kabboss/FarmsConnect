const baseURL = 'https://farmsconnect-b084ddb02391.herokuapp.com';

async function uploadVideo() {
    const fileInput = document.getElementById('videoFile');
    const adminCode = document.getElementById('adminCode').value;
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('code', adminCode);

    const response = await fetch(`${baseURL}/upload`, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('Vidéo téléversée avec succès');
        loadVideos();
    } else {
        alert('Échec de téléversement');
    }
}

async function loadVideos() {
    const response = await fetch(`${baseURL}/videos`);
    const videos = await response.json();
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = videos.map(video => `
        <div class="video-item">
            <video controls src="${baseURL}/videos/${video._id}"></video>
            <button onclick="deleteVideo('${video._id}')">Supprimer</button>
        </div>
    `).join('');
}

async function deleteVideo(id) {
    const adminCode = prompt("Entrez le code d'accès pour supprimer la vidéo");
    const response = await fetch(`${baseURL}/videos/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: adminCode })
    });

    if (response.ok) {
        alert('Vidéo supprimée avec succès');
        loadVideos();
    } else {
        alert('Échec de la suppression');
    }
}

// Charger les vidéos au démarrage
loadVideos();
