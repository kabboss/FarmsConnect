// Connexion au serveur Socket.IO
const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com', {
    transports: ['websocket'], // Forcer l'utilisation du transport WebSocket
});

// Classe principale pour gérer le forum
class Forum {
    constructor() {
        this.messageList = document.getElementById("message-list");
        this.messageForm = document.getElementById("message-form");
        this.messageInput = document.getElementById("message-input");
        this.searchInput = document.getElementById("search-input");
        this.pagination = { page: 1, limit: 5 }; // Pagination : page actuelle et limite
        this.sortOption = "date"; // Options de tri : "date" ou "popularity"

        this.initEventListeners();
        this.loadMessages();
        this.listenForNewMessages();
    }

    // Fonction générique pour effectuer une requête API
    async apiRequest(url, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            // Vérification de la réponse
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.error('Erreur lors de la requête API :', error);
            throw error;
        }
    }

    // Fonction pour charger les messages
    async loadMessages() {
        const response = await fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages');  // Récupérer les messages via l'API
        const messages = await response.json();  // Convertir la réponse en JSON
        const messageList = document.getElementById('message-list');  // Récupérer la section des messages

        messageList.innerHTML = "";  // Vider la liste de messages avant de la remplir à nouveau
        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

// Fonction pour afficher un message
displayMessage({ _id, username = "Utilisateur anonyme", content, replies = [], likes = 0, dislikes = 0, date }) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.dataset.id = _id;

    messageDiv.innerHTML = `
        <strong>${username}:</strong> ${content}
        <div class="meta">
            <span>${new Date(date).toLocaleString()}</span>
            <button class="like-button">👍 <span id="like-count-${_id}">${likes}</span></button>
            <button class="dislike-button">👎 <span id="dislike-count-${_id}">${dislikes}</span></button>
        </div>
        <div class="actions">
            <button class="edit-button">Modifier</button>
            <button class="delete-button">Supprimer</button>
            <button class="reply-button">Répondre</button>
        </div>
        <div class="reply-input" style="display:none;">
            <input type="text" class="reply-message-input" placeholder="Votre réponse...">
            <button class="send-reply-button">Envoyer</button>
        </div>
        <div class="replies">
            ${replies.map(reply => `<div class="reply"><strong>${reply.username}:</strong> ${reply.content}</div>`).join("")}
        </div>
    `;

    this.messageList.appendChild(messageDiv);
}

    // Fonction pour ajouter un message
    async addMessage(content) {
        const username = localStorage.getItem('username') || "Utilisateur";
        try {
            await this.apiRequest('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages', 'POST', { username, content });
            this.messageInput.value = "";
            this.loadMessages();  // Recharger les messages après l'ajout
        } catch (error) {
            console.error('Erreur lors de l\'ajout du message :', error);
        }
    }

    // Fonction pour ajouter une réponse à un message
    async addReply(messageId, content) {
        const username = localStorage.getItem('username') || "Utilisateur";
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}/replies`, 'POST', { username, content });
            this.loadMessages();  // Recharger les messages après l'ajout de la réponse
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réponse :', error);
        }
    }

    // Fonction pour éditer un message
    async editMessage(messageId, newContent) {
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, 'PUT', { content: newContent });
            this.loadMessages();  // Recharger les messages après l'édition
        } catch (error) {
            console.error('Erreur lors de la modification du message :', error);
        }
    }

    // Fonction pour supprimer un message
    async deleteMessage(messageId) {
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, 'DELETE');
            this.loadMessages();  // Recharger les messages après la suppression
        } catch (error) {
            console.error('Erreur lors de la suppression du message :', error);
        }
    }

// Fonction pour réagir à un message (ajouter un like ou un dislike)
async reactToMessage(messageId, type) {
    // Empêcher un utilisateur de liker plusieurs fois le même message
    const likedMessages = JSON.parse(localStorage.getItem('likedMessages')) || [];
    if (likedMessages.includes(messageId)) {
        alert("Vous avez déjà aimé ce message !");
        return;
    }

    const url = type === 'like' 
        ? `https://farmsconnect-b084ddb02391.herokuapp.com/like/${messageId}`
        : `https://farmsconnect-b084ddb02391.herokuapp.com/dislike/${messageId}`;

    try {
        const response = await fetch(url, { method: 'POST' });

        if (response.ok) {
            const data = await response.json();  // Récupérer les données mises à jour
            const likeCountElement = document.querySelector(`#like-count-${messageId}`);
            const dislikeCountElement = document.querySelector(`#dislike-count-${messageId}`);

            // Mettre à jour le nombre de likes et dislikes
            if (likeCountElement) {
                likeCountElement.textContent = `${data.likes} likes`;  // Mettre à jour le nombre de likes
            }

            if (dislikeCountElement) {
                dislikeCountElement.textContent = `${data.dislikes} dislikes`;  // Mettre à jour le nombre de dislikes
            }

            // Enregistrer l'ID du message liké pour éviter les likes multiples
            likedMessages.push(messageId);
            localStorage.setItem('likedMessages', JSON.stringify(likedMessages));
        } else {
            const errorData = await response.json();
            console.error('Erreur lors de la réaction au message:', errorData.message);
        }
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
    }
}
    // Fonction pour gérer la pagination
    changePage(increment) {
        this.pagination.page += increment;
        if (this.pagination.page < 1) this.pagination.page = 1;
        this.loadMessages();
    }

    // Fonction pour changer l'option de tri
    changeSort(option) {
        this.sortOption = option;
        this.loadMessages();
    }

    // Initialisation des écouteurs d'événements
    initEventListeners() {
        this.messageForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newMessage = this.messageInput.value.trim();
            if (newMessage) this.addMessage(newMessage);
        });

        this.messageList.addEventListener("click", (e) => {
            const messageDiv = e.target.closest(".message");
            const messageId = messageDiv?.dataset.id;

            if (e.target.classList.contains("reply-button")) {
                const replyInputDiv = messageDiv.querySelector(".reply-input");
                replyInputDiv.style.display = replyInputDiv.style.display === "none" ? "block" : "none";
            }

            if (e.target.classList.contains("send-reply-button")) {
                const replyInput = messageDiv.querySelector(".reply-message-input").value.trim();
                if (replyInput) this.addReply(messageId, replyInput);
            }

            if (e.target.classList.contains("edit-button")) {
                const newContent = prompt("Modifier le message:");
                if (newContent) this.editMessage(messageId, newContent);
            }

            if (e.target.classList.contains("delete-button")) {
                this.deleteMessage(messageId);
            }

            if (e.target.classList.contains("like-button")) {
                this.reactToMessage(messageId, "like");
            }

            if (e.target.classList.contains("dislike-button")) {
                this.reactToMessage(messageId, "dislike");
            }
        });

        this.searchInput?.addEventListener("input", () => this.loadMessages());

        document.getElementById("next-page").addEventListener("click", () => this.changePage(1));
        document.getElementById("prev-page").addEventListener("click", () => this.changePage(-1));

        document.getElementById("sort-option").addEventListener("change", (e) => {
            this.changeSort(e.target.value);
        });
    }

    // Fonction pour écouter les nouveaux messages via Socket.IO
    listenForNewMessages() {
        socket.on('newMessage', (message) => {
            this.displayNotification("Un nouveau message a été ajouté !");
            this.displayMessage(message);
        });
    }

    // Fonction pour afficher une notification
    displayNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialiser le forum
document.addEventListener("DOMContentLoaded", () => {
    const forum = new Forum();
});
