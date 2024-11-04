  const socket = io();

        // Uploader un contenu avec vérification du code de sécurité
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('securityCode', document.getElementById('securityCode').value);
            formData.append('title', document.getElementById('title').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('category', document.getElementById('category').value);
            formData.append('type', document.getElementById('type').value);
            formData.append('file', document.getElementById('file').files[0]);

            try {
                const response = await fetch('/api/content/upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                document.getElementById('uploadMessage').innerText = result.message || 'Contenu uploadé avec succès';
            } catch (error) {
                document.getElementById('uploadMessage').innerText = 'Erreur lors de l\'upload du contenu';
            }
        });

        // Charger les contenus
        async function loadContents() {
            try {
                const response = await fetch('/api/content/all');
                const contents = await response.json();
                const contentList = document.getElementById('content-list');
                contentList.innerHTML = '';

                contents.forEach((content) => {
                    const contentItem = document.createElement('div');
                    contentItem.classList.add('content-item');
                    contentItem.innerHTML = `
                        <h3>${content.title}</h3>
                        <p>${content.description}</p>
                        <p>Catégorie: ${content.category}</p>
                        <p>Niveau: ${content.level}</p>
                        <button onclick="likeContent('${content._id}')">❤️ <span id="content-like-${content._id}">${content.likes}</span></button>
                        <div class="media">
                            ${content.type === 'video' ? `<video controls src="${content.filePath}"></video>` : `<audio controls src="${content.filePath}"></audio>`}
                        </div>
                        <div class="comments" id="comments-${content._id}">
                            <h4>Commentaires</h4>
                            <div class="comment-section"></div>
                            <input type="text" placeholder="Votre commentaire" id="comment-input-${content._id}">
                            <button onclick="postComment('${content._id}')">Commenter</button>
                        </div>
                    `;
                    contentList.appendChild(contentItem);
                    loadComments(content._id);
                });
            } catch (error) {
                console.error('Erreur lors du chargement des contenus', error);
            }
        }

        // Fonction pour liker un contenu
        async function likeContent(contentId) {
            try {
                const response = await fetch(`/api/content/like/${contentId}`, { method: 'PATCH' });
                const updatedContent = await response.json();
                document.getElementById(`content-like-${contentId}`).innerText = updatedContent.likes;
            } catch (error) {
                console.error('Erreur lors du like', error);
            }
        }

        // Poster un commentaire
        async function postComment(contentId) {
            const commentInput = document.getElementById(`comment-input-${contentId}`);
            const commentText = commentInput.value;
            if (!commentText) return;

            try {
                const response = await fetch('/api/comments/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contentId, user: 'Utilisateur', text: commentText }),
                });
                const newComment = await response.json();
                commentInput.value = '';
                displayComment(contentId, newComment);
            } catch (error) {
                console.error('Erreur lors de l\'ajout du commentaire', error);
            }
        }

        // Charger les commentaires
        async function loadComments(contentId) {
            try {
                const response = await fetch(`/api/comments/${contentId}`);
                const comments = await response.json();
                comments.forEach((comment) => displayComment(contentId, comment));
            } catch (error) {
                console.error('Erreur lors du chargement des commentaires', error);
            }
        }

        // Afficher un commentaire
        function displayComment(contentId, comment) {
            const commentTemplate = document.getElementById('comment-template').content.cloneNode(true);
            commentTemplate.querySelector('.comment-text').innerText = comment.text;
            commentTemplate.querySelector('.comment-user').innerText = `Par ${comment.user}`;
            commentTemplate.querySelector('.likes-count').innerText = comment.likes;
            document.getElementById(`comments-${contentId}`).querySelector('.comment-section').appendChild(commentTemplate);
        }

        // Notification pour les nouveaux contenus
        socket.on('new-content', (content) => {
            const notification = document.createElement('div');
            notification.classList.add('notification');
            notification.innerText = `Nouveau contenu ajouté : ${content.title}`;
            document.getElementById('notifications').appendChild(notification);
            loadContents(); // Recharger la liste des contenus
        });

        // Charger les contenus au démarrage
        loadContents();
