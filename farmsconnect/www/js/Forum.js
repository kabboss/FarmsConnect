// Connexion au serveur Socket.IO
const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com', {
    transports: ['websocket'], // Forcer le transport WebSocket
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

            // Vérifiez si la réponse contient un contenu
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.error('Erreur lors de la requête API :', error);
            throw error;
        }
    }

    async loadMessages() {
        const { page, limit } = this.pagination;
        const sort = this.sortOption;
        const search = this.searchInput?.value || "";

        const url = `https://farmsconnect-b084ddb02391.herokuapp.com/api/messages?page=${page}&limit=${limit}&sort=${sort}&search=${encodeURIComponent(search)}`;

        try {
            const messages = await this.apiRequest(url);
            this.messageList.innerHTML = ""; // Réinitialiser la liste des messages
            messages.forEach(message => this.displayMessage(message));
        } catch (error) {
            console.error('Erreur lors du chargement des messages :', error);
        }
    }

    displayMessage({ _id, username = "Utilisateur anonyme", content, replies = [], likes = 0, dislikes = 0, date }) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.dataset.id = _id;

        messageDiv.innerHTML = `
            <strong>${username}:</strong> ${content}
            <div class="meta">
                <span>${new Date(date).toLocaleString()}</span>
                <button class="like-button">👍 ${likes}</button>
                <button class="dislike-button">👎 ${dislikes}</button>
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

    async addMessage(content) {
        const username = localStorage.getItem('username') || "Utilisateur";
        try {
            await this.apiRequest('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages', 'POST', { username, content });
            this.messageInput.value = "";
            this.loadMessages();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du message :', error);
        }
    }

    async addReply(messageId, content) {
        const username = localStorage.getItem('username') || "Utilisateur";
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}/replies`, 'POST', { username, content });
            this.loadMessages();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réponse :', error);
        }
    }

    async editMessage(messageId, newContent) {
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, 'PUT', { content: newContent });
            this.loadMessages();
        } catch (error) {
            console.error('Erreur lors de la modification du message :', error);
        }
    }

    async deleteMessage(messageId) {
        try {
            await this.apiRequest(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, 'DELETE');
            this.loadMessages();
        } catch (error) {
            console.error('Erreur lors de la suppression du message :', error);
        }
    }

    async reactToMessage(messageId, type) {
        if (type === 'like') {
            try {
                const response = await fetch(`https://farmsconnect-b084ddb02391.herokuapp.com/like/${messageId}`, {
                    method: 'POST',
                });
                console.log('ID du commentaire:', messageId); // Ajoutez cette ligne pour vérifier l'ID
                // On vérifie d'abord si la requête a réussi
                if (response.ok) {
                    const data = await response.json();
                    // Mettez à jour le nombre de likes dans l'UI
                    const likeCountElement = document.querySelector(`#like-count-${messageId}`);
                    likeCountElement.textContent = data.likes; // Le nouveau nombre de likes
                } else {
                    const errorData = await response.json();
                    console.error('Erreur lors de l\'ajout du like:', errorData.message);
                }
            } catch (error) {
                console.error('Erreur lors de la requête API:', error);
            }
        }
    }
    


    
    changePage(increment) {
        this.pagination.page += increment;
        if (this.pagination.page < 1) this.pagination.page = 1;
        this.loadMessages();
    }

    changeSort(option) {
        this.sortOption = option;
        this.loadMessages();
    }

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

    listenForNewMessages() {
        socket.on('newMessage', (message) => {
            this.displayNotification("Un nouveau message a été ajouté !");
            this.displayMessage(message);
        });
    }

    displayNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Forum();
});
