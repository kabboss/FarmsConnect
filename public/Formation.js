const socket = io();

async function loadContent() {
    const response = await fetch('/api/content/all');
    const contents = await response.json();
    const contentList = document.getElementById('videos');
    contents.forEach(content => {
        const item = document.createElement('div');
        item.innerHTML = `
            <h3>${content.title}</h3>
            <p>${content.description}</p>
            <video src="${content.filePath}" controls></video>
            <button onclick="likeContent('${content._id}')">❤️ Like</button> ${content.likes} likes
        `;
        contentList.appendChild(item);
    });
}

async function addComment() {
    const contentId = 'exampleContentId';  // Remplace avec l'ID réel
    const user = 'Anonymous';  // Remplace par l'utilisateur actuel
    const text = document.getElementById('comment-input').value;
    await fetch('/api/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, user, text })
    });
    socket.emit('new-comment', { contentId, user, text });
}

socket.on('update-content', loadContent);
socket.on('update-comments', loadComments);
loadContent();
