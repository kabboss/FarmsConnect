function showVideos(category) {
    // Cacher toutes les vidéos
    const allVideos = document.querySelectorAll('.video-section');
    allVideos.forEach(video => {
        video.style.display = 'none';
    });

    // Afficher la vidéo correspondante
    const selectedVideos = document.getElementById(category);
    if (selectedVideos) {
        selectedVideos.style.display = 'block';
        selectedVideos.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Défilement vers la section des vidéos
    }
}
