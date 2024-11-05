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
            <script>
            /* Style général des messages */
.message {
    background-color: #f9f9f9; /* Couleur de fond */
    border: 1px solid #ddd; /* Bordure */
    border-radius: 5px; /* Coins arrondis */
    padding: 10px; /* Espacement interne */
    margin: 10px 0; /* Espacement externe */
    position: relative; /* Pour le positionnement absolu des boutons */
}

/* Style pour le nom d'utilisateur */
.message strong {
    color: #2c3e50; /* Couleur du texte pour le nom d'utilisateur */
    font-size: 1.1em; /* Taille de police légèrement plus grande */
}

/* Style des boutons */
button {
    background-color: #3498db; /* Couleur de fond des boutons */
    color: white; /* Couleur du texte des boutons */
    border: none; /* Pas de bordure */
    border-radius: 3px; /* Coins arrondis pour les boutons */
    padding: 5px 10px; /* Espacement interne */
    cursor: pointer; /* Curseur en main au survol */
    margin-left: 5px; /* Espacement à gauche des boutons */
    transition: background-color 0.3s; /* Transition pour l'effet de survol */
}

button:hover {
    background-color: #2980b9; /* Couleur au survol */
}

/* Style du champ de réponse */
.reply-input {
    margin-top: 10px; /* Espacement au-dessus du champ de réponse */
    display: flex; /* Pour aligner les éléments horizontalement */
}

.reply-message-input {
    flex-grow: 1; /* Prend tout l'espace disponible */
    padding: 5px; /* Espacement interne */
    border: 1px solid #ccc; /* Bordure du champ */
    border-radius: 3px; /* Coins arrondis */
    margin-right: 5px; /* Espacement à droite */
}

/* Style pour les réponses */
.replies {
    margin-top: 10px; /* Espacement au-dessus des réponses */
    padding-left: 20px; /* Indentation pour les réponses */
    border-left: 2px solid #3498db; /* Bordure à gauche pour les réponses */
}

/* Style pour les réponses individuelles */
.reply {
    background-color: #e9ecef; /* Couleur de fond des réponses */
    padding: 5px; /* Espacement interne */
    margin: 5px 0; /* Espacement externe */
    border-radius: 5px; /* Coins arrondis */
}

            </script>

        `;

        message.replies.forEach(reply => {
            const replyDiv = document.createElement("div");
            replyDiv.className = "reply";
            replyDiv.innerHTML = `
<div class="reply">
    <strong>${reply.username}:</strong> ${reply.content}
    <button class="reply-button">Répondre</button>
    <div class="reply-input" style="display:none;">
        <input type="text" class="reply-message-input" placeholder="Votre réponse..." required>
        <button class="send-reply-button">Envoyer</button>
    </div>
</div>

<script>
/* Style pour chaque réponse */
.reply {
    background-color: #e9ecef; /* Couleur de fond des réponses */
    padding: 8px; /* Espacement interne */
    margin: 5px 0; /* Espacement externe */
    border-radius: 5px; /* Coins arrondis */
    position: relative; /* Pour le positionnement des éléments internes */
}

/* Style pour le nom d'utilisateur dans les réponses */
.reply strong {
    color: #2980b9; /* Couleur du texte pour le nom d'utilisateur */
    font-size: 1em; /* Taille de police pour le nom d'utilisateur */
}

/* Style des boutons pour répondre */
.reply-button {
    background-color: #3498db; /* Couleur de fond du bouton Répondre */
    color: white; /* Couleur du texte du bouton */
    border: none; /* Pas de bordure */
    border-radius: 3px; /* Coins arrondis */
    padding: 5px 8px; /* Espacement interne */
    cursor: pointer; /* Curseur en main au survol */
    margin-left: 10px; /* Espacement à gauche */
    transition: background-color 0.3s; /* Transition pour l'effet de survol */
}

.reply-button:hover {
    background-color: #2980b9; /* Couleur au survol */
}

/* Style du champ de réponse dans les réponses */
.reply-input {
    margin-top: 5px; /* Espacement au-dessus du champ de réponse */
    display: flex; /* Pour aligner les éléments horizontalement */
}

.reply-message-input {
    flex-grow: 1; /* Prend tout l'espace disponible */
    padding: 5px; /* Espacement interne */
    border: 1px solid #ccc; /* Bordure du champ */
    border-radius: 3px; /* Coins arrondis */
    margin-right: 5px; /* Espacement à droite */
}

/* Style du bouton Envoyer dans les réponses */
.send-reply-button {
    background-color: #28a745; /* Couleur de fond du bouton Envoyer */
    color: white; /* Couleur du texte du bouton */
    border: none; /* Pas de bordure */
    border-radius: 3px; /* Coins arrondis */
    padding: 5px 8px; /* Espacement interne */
    cursor: pointer; /* Curseur en main au survol */
    transition: background-color 0.3s; /* Transition pour l'effet de survol */
}

.send-reply-button:hover {
    background-color: #218838; /* Couleur au survol */
}


</script>



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
