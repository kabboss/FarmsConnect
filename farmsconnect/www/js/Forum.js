// Connexion sécurisée au serveur Socket.IO avec transport WebSocket
const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com', {
    transports: ['websocket'],
});

// Gestion du forum dynamique avec animations et fonctionnalités avancées
class Forum {
    constructor() {
        // Élément du DOM
        this.messageList = document.getElementById("message-list");
        this.messageForm = document.getElementById("message-form");
        this.messageInput = document.getElementById("message-input");
        this.sortSelect = document.getElementById("sort-select");
        this.searchInput = document.getElementById("search-input");

        // Pagination et tri par défaut
        this.pagination = { page: 1, limit: 10 };
        this.sortOption = "date";
        this.searchQuery = "";

        // Initialisation
        this._bindEvents();
        this._initializeForum();
    }

    // Initialiser le forum
    async _initializeForum() {
        try {
            this._displayNotification("Chargement des messages...", "info");
            await this._loadMessages();
            this._listenForNewMessages();
        } catch (error) {
            this._displayNotification("Erreur lors de l'initialisation du forum", "error");
            console.error(error);
        }
    }

    // Gestion des événements
    _bindEvents() {
        this.messageForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const content = this.messageInput.value.trim();
            if (content) this._addMessage(content);
        });

        this.messageList.addEventListener("click", (event) => this._handleListClick(event));

        this.sortSelect.addEventListener("change", (event) => {
            this.sortOption = event.target.value;
            this._loadMessages();
        });

        this.searchInput.addEventListener("input", (event) => {
            this.searchQuery = event.target.value.trim().toLowerCase();
            this._loadMessages();
        });
    }

    // Charger les messages
    async _loadMessages() {
        try {
            const { page, limit } = this.pagination;
            const messages = await this._apiRequest(
                `/api/messages?page=${page}&limit=${limit}`
            );

            // Filtrage par recherche
            const filteredMessages = messages.filter((message) =>
                message.content.toLowerCase().includes(this.searchQuery)
            );

            this.messageList.innerHTML = ""; // Réinitialiser la liste
            filteredMessages.sort(this._getSortFunction());
            filteredMessages.forEach((message) => this._displayMessage(message));

            this._scrollToBottom();
        } catch (error) {
            this._displayNotification("Erreur lors du chargement des messages", "error");
            console.error(error);
        }
    }

    // Afficher un message avec animations
    _displayMessage({ _id, username = "Utilisateur anonyme", content, replies = [], likes = 0, dislikes = 0, date }) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message fade-in";
        messageDiv.dataset.id = _id;

        messageDiv.innerHTML = `
            <div class="meta">
                <span>${new Date(date).toLocaleString()}</span>
                <strong>${username}:</strong>
            </div>
            <div class="content">${content}</div>
            <div class="actions">
                <button class="edit-button">✏️ Modifier</button>
                <button class="delete-button">🗑️ Supprimer</button>
                <button class="reply-button">💬 Répondre</button>
            </div>
            <div class="reply-input" style="display:none;">
                <input type="text" class="reply-message-input" placeholder="Votre réponse...">
                <button class="send-reply-button">Envoyer</button>
            </div>
            <div class="replies">
                ${replies.map((reply) => `<div class="reply"><strong>${reply.username}:</strong> ${reply.content}</div>`).join("")}
            </div>
        `;

        this.messageList.appendChild(messageDiv);
    }

    // Ajouter un message
    async _addMessage(content) {
        try {
            const username = localStorage.getItem('username') || "Utilisateur";
            await this._apiRequest('/api/messages', 'POST', { username, content });
            this.messageInput.value = "";
            this._displayNotification("Message ajouté avec succès !", "success");
            await this._loadMessages();
        } catch (error) {
            this._displayNotification("Erreur lors de l'ajout du message", "error");
            console.error(error);
        }
    }

    // Modifier un message
    async _editMessage(messageId, content) {
        try {
            await this._apiRequest(`/api/messages/${messageId}`, 'PUT', { content });
            this._displayNotification("Message modifié avec succès !", "success");
            await this._loadMessages();
        } catch (error) {
            this._displayNotification("Erreur lors de la modification du message", "error");
            console.error(error);
        }
    }

    // Supprimer un message
    async _deleteMessage(messageId) {
        try {
            await this._apiRequest(`/api/messages/${messageId}`, 'DELETE');
            this._displayNotification("Message supprimé avec succès !", "success");
            await this._loadMessages();
        } catch (error) {
            this._displayNotification("Erreur lors de la suppression du message", "error");
            console.error(error);
        }
    }

    // Réagir à un message (likes/dislikes)
    async _reactToMessage(messageId, type) {
        try {
            const url = type === 'like' 
                ? `/api/messages/${messageId}/like`
                : `/api/messages/${messageId}/dislike`;

            await this._apiRequest(url, 'POST');
            this._displayNotification(`Message ${type === "like" ? "aimé" : "désapprouvé"} !`, "info");
            await this._loadMessages();
        } catch (error) {
            this._displayNotification(`Erreur lors de la réaction (${type})`, "error");
            console.error(error);
        }
    }

    // Notifications animées
    _displayNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `notification ${type} slide-in`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.replace("slide-in", "slide-out");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Fonction utilitaire pour requête API
    async _apiRequest(endpoint, method = 'GET', body = null) {
        const url = `https://farmsconnect-b084ddb02391.herokuapp.com${endpoint}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        return response.json();
    }

    // Obtenir la fonction de tri
    _getSortFunction() {
        const sortFunctions = {
            date: (a, b) => new Date(a.date) - new Date(b.date),
            popularity: (a, b) => b.likes - a.likes,
        };
        return sortFunctions[this.sortOption] || sortFunctions.date;
    }

    // Écouter les nouveaux messages
    _listenForNewMessages() {
        socket.on('newMessage', () => this._loadMessages());
    }

    // Défiler vers le bas
    _scrollToBottom() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }
}

// Initialiser le forum
new Forum();
