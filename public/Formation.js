document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(error => console.error('Erreur:', error));
});

document.getElementById('deleteForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    
    fetch('/delete', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            console.error('Erreur:', response);
        }
    })
    .catch(error => console.error('Erreur:', error));
});

// Load videos on page load
window.addEventListener('load', function () {
    fetch('/videos')
        .then(response => response.json())
        .then(videos => {
            const videoList = document.getElementById('videoList');
            videos.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `
                    <h3>${video.filename}</h3>
                    <video controls>
                        <source src="${video.path}" type="video/mp4">
                        Votre navigateur ne supporte pas la vidéo.
                    </video>
                `;
                videoList.appendChild(videoItem);
            });
        })
        .catch(error => console.error('Erreur:', error));
});
