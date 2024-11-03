const socket = io('https://farmsconnect-b084ddb02391.herokuapp.com'); // Assurez-vous d'utiliser l'URL de votre serveur

document.addEventListener("DOMContentLoaded", function() {
    const messageList = document.getElementById("message-list");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    // Fonction pour afficher un message
    function displayMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        
        // Vérifiez si username existe pour éviter 'undefined'
        const username = message.username || "Utilisateur anonyme";
        
        messageDiv.innerHTML = `
            <strong>${username}:</strong> ${message.content}
            <button class="edit-button" data-id="${message._id}">Modifier</button>
            <button class="delete-button" data-id="${message._id}">Supprimer</button>
            <button class="reply-button" data-id="${message._id}">Répondre</button>
            <div class="reply-input" style="display:none;">
                <input type="text" class="reply-message-input" placeholder="Votre réponse..." required>
                <button class="send-reply-button">Envoyer</button>
            </div>
            <div class="replies"></div> 
        `;

        message.replies.forEach(reply => {
            const replyDiv = document.createElement("div");
            replyDiv.className = "reply";
            replyDiv.innerHTML = `
                <strong>${reply.username}:</strong> ${reply.content}
                <button class="reply-button">Répondre</button>
                <div class="reply-input" style="display:none;">
                    <input type="text" class="reply-message-input" placeholder="Votre réponse..." required>
                    <button class="send-reply-button">Envoyer</button>
                </div>
            `;
            messageDiv.querySelector(".replies").appendChild(replyDiv);
        });

        messageList.appendChild(messageDiv);
    }

    // Charger les messages depuis le backend
    function loadMessages() {
        fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages')
            .then(response => response.json())
            .then(data => {
                messageList.innerHTML = "";
                data.forEach(message => displayMessage(message));
            });
    }

    // Charger les messages au chargement de la page
    loadMessages();

    // Envoyer un nouveau message au backend
    messageForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const newMessage = messageInput.value;
        const username = localStorage.getItem('username');

        if (newMessage.trim() !== "" && username) {
            fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, content: newMessage })
            }).then(() => {
                messageInput.value = "";
                loadMessages(); 
            });
        }
    });

    // Écoute des événements de socket pour les nouveaux messages
    socket.on('newMessage', message => {
        displayMessage(message);
    });

    // Gestion des réponses
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("reply-button")) {
            const replyInputDiv = e.target.nextElementSibling;
            replyInputDiv.style.display = "block"; 
        }
    });

    // Envoyer une réponse
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("send-reply-button")) {
            const replyInput = e.target.previousElementSibling; 
            const replyMessage = replyInput.value;
            const username = localStorage.getItem('username');
            const messageDiv = e.target.closest(".message"); 
            const messageId = messageDiv.querySelector(".reply-button").getAttribute("data-id"); 

            if (replyMessage.trim() !== "" && username) {
                fetch(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}/replies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, content: replyMessage })
                }).then(() => {
                    replyInput.value = "";
                    loadMessages(); 
                });
            }
        }
    });

    // Modifier un message
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("edit-button")) {
            const messageDiv = e.target.closest(".message");
            const messageId = e.target.getAttribute("data-id"); 
            const content = messageDiv.childNodes[1].textContent; 
            const newContent = prompt("Modifier votre message:", content);

            if (newContent) {
                fetch(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: newContent })
                }).then(() => {
                    loadMessages(); 
                });
            }
        }
    });

    // Supprimer un message
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete-button")) {
            const messageId = e.target.getAttribute("data-id"); 

            fetch(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}`, {
                method: 'DELETE'
            }).then(() => {
                loadMessages(); 
            });
        }
    });
});
