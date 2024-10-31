document.getElementById('learn-more-btn').addEventListener('click', function() {
    const moreInfoDiv = document.getElementById('more-info');
    moreInfoDiv.classList.toggle('hidden');
    
    if (moreInfoDiv.classList.contains('hidden')) {
        this.innerText = 'En Savoir Plus';
    } else {
        this.innerText = 'Réduire';
    }
});
