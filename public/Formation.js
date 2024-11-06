document.getElementById('post-comment').addEventListener('click', function() {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    
    if (commentText) {
      // Poster le commentaire
      const commentList = document.getElementById('comments-list');
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment';
      commentDiv.innerHTML = `<p>${commentText}</p>`;
      commentList.appendChild(commentDiv);
      
      // Effacer le champ de saisie
      commentInput.value = '';
      
      // Optionnel : envoyer le commentaire à la base de données MongoDB
      // Vous pouvez utiliser une requête AJAX ici pour envoyer le commentaire au serveur Node.js
    }
  });
  
  document.getElementById('send-chat').addEventListener('click', function() {
    const chatInput = document.getElementById('chat-input');
    const chatMessage = chatInput.value.trim();
  
    if (chatMessage) {
      // Ajouter le message au chat
      const chatMessages = document.getElementById('chat-messages');
      const chatDiv = document.createElement('div');
      chatDiv.className = 'chat-message';
      chatDiv.innerHTML = `<p>${chatMessage}</p>`;
      chatMessages.appendChild(chatDiv);
  
      // Effacer le champ de saisie
      chatInput.value = '';
  
      // Optionnel : envoyer le message au serveur pour stockage en temps réel
    }
  });
  