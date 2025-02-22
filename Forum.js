document.addEventListener("DOMContentLoaded", function() {
    const messageList = document.getElementById("message-list");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    // Fonction pour afficher un message
    function displayMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.innerHTML = `
            <strong>${message.username}:</strong> ${message.content}
            <button class="reply-button" data-id="${message._id}">Répondre</button>
            <div class="reply-input" style="display:none;">
                <input type="text" class="reply-message-input" placeholder="Votre réponse..." required>
                <button class="send-reply-button">Envoyer</button>
            </div>
            <div class="replies"></div> <!-- Pour afficher les réponses -->
        `;

        // Afficher les réponses
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
        fetch('http://localhost:3002/api/messages')
            .then(response => response.json())
            .then(data => {
                messageList.innerHTML = ""; // Nettoyer la liste avant d'afficher les messages
                data.forEach(message => displayMessage(message));
            });
    }

    // Charger les messages au chargement de la page
    loadMessages();

    // Envoyer un nouveau message au backend
    messageForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const newMessage = messageInput.value;
        const username = localStorage.getItem('username'); // Utiliser le nom d'utilisateur stocké

        if (newMessage.trim() !== "" && username) {
            fetch('http://localhost:3002/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, content: newMessage })
            }).then(() => {
                messageInput.value = "";
                loadMessages(); // Recharger les messages pour afficher le nouveau message
            });
        }
    });

    // Gestion des réponses
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("reply-button")) {
            const replyInputDiv = e.target.nextElementSibling;
            replyInputDiv.style.display = "block"; // Afficher le champ de saisie pour la réponse
        }
    });

    // Envoyer une réponse
    messageList.addEventListener("click", function(e) {
        if (e.target.classList.contains("send-reply-button")) {
            const replyInput = e.target.previousElementSibling; // Récupérer le champ de saisie
            const replyMessage = replyInput.value;
            const username = localStorage.getItem('username'); // Utiliser le nom d'utilisateur stocké
            const messageDiv = e.target.closest(".message"); // Récupérer le div du message d'origine
            const messageId = messageDiv.querySelector(".reply-button").getAttribute("data-id"); // Récupérer l'ID du message d'origine

            if (replyMessage.trim() !== "" && username) {
                fetch(`http://localhost:3002/api/messages/${messageId}/replies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, content: replyMessage })
                }).then(() => {
                    replyInput.value = "";
                    replyInput.parentElement.style.display = "none"; // Masquer le champ de saisie
                    loadMessages(); // Recharger les messages pour afficher la réponse
                });
            }
        }
    });
});
