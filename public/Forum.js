document.addEventListener("DOMContentLoaded", function () {
    const messageList = document.getElementById("message-list");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");
    const notification = document.getElementById("notification");

    const socket = io("https://farmsconnect-b084ddb02391.herokuapp.com");
    let username = ""; // Variable pour stocker le nom d'utilisateur

    // Fonction pour récupérer les informations de l'utilisateur
    async function getUserInfo() {
        try {
            const response = await fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/user', {
                method: 'GET',
                credentials: 'include' // Inclure les cookies si nécessaire
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération des informations utilisateur.");
            const data = await response.json();
            username = data.username; // Assurez-vous que le serveur renvoie le nom d'utilisateur dans la réponse

            if (!username) {
                alert("Nom d'utilisateur non trouvé. Veuillez vous connecter.");
                return; // Arrêter l'exécution si le nom d'utilisateur n'est pas trouvé
            }

            // Charger les messages après avoir récupéré le nom d'utilisateur
            loadMessages();
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer les informations utilisateur.");
        }
    }

    // Charger les messages depuis le backend
    async function loadMessages() {
        try {
            const response = await fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages');
            if (!response.ok) throw new Error("Erreur lors du chargement des messages.");
            const data = await response.json();
            messageList.innerHTML = "";
            data.forEach(message => displayMessage(message));
        } catch (error) {
            console.error(error);
            displayErrorMessage("Impossible de charger les messages."); // Afficher un message d'erreur
        }
    }

    // Afficher un message
    function displayMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.innerHTML = `
            <strong>${message.username}:</strong> ${message.content}
            <button class="reply-button" data-id="${message._id}">Répondre</button>
            <div class="replies"></div>
        `;
        message.replies.forEach(reply => displayReply(reply, messageDiv));
        messageList.appendChild(messageDiv);

        // Faire défiler vers le bas pour montrer le nouveau message
        messageList.scrollTop = messageList.scrollHeight;
    }

    // Afficher une réponse
    function displayReply(reply, parentDiv) {
        const replyDiv = document.createElement("div");
        replyDiv.className = "reply";
        replyDiv.innerHTML = `<strong>${reply.username}:</strong> ${reply.content}`;
        parentDiv.querySelector(".replies").appendChild(replyDiv);
    }

    // Afficher un message d'erreur
    function displayErrorMessage(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000); // Supprimer le message après 5 secondes
    }

    // Envoi d'un nouveau message
    messageForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content) return alert("Le message ne peut pas être vide.");

        try {
            const response = await fetch('https://farmsconnect-b084ddb02391.herokuapp.com/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, content })
            });
            if (!response.ok) throw new Error("Erreur lors de l'envoi du message.");

            messageInput.value = "";
            alert("Message envoyé avec succès."); // Afficher une confirmation d'envoi
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'envoi du message.");
        }
    });

    // Notifications et affichage en temps réel
    socket.on("newMessage", (message) => {
        displayMessage(message);
        notification.style.display = "block";
        setTimeout(() => { notification.style.display = "none"; }, 3000);
    });

    socket.on("newReply", ({ messageId, reply }) => {
        const messageDiv = document.querySelector(`[data-id="${messageId}"]`).closest(".message");
        if (messageDiv) {
            displayReply(reply, messageDiv);
            notification.style.display = "block";
            setTimeout(() => { notification.style.display = "none"; }, 3000);
        }
    });

    // Gestion des réponses
    messageList.addEventListener("click", async function (e) {
        if (e.target.classList.contains("reply-button")) {
            const messageId = e.target.getAttribute("data-id");
            const replyInput = document.createElement("input");
            const sendButton = document.createElement("button");

            replyInput.placeholder = "Votre réponse...";
            sendButton.textContent = "Envoyer";

            e.target.after(replyInput, sendButton);

            sendButton.addEventListener("click", async () => {
                const content = replyInput.value.trim();
                if (!content) return alert("La réponse ne peut pas être vide.");

                try {
                    const response = await fetch(`https://farmsconnect-b084ddb02391.herokuapp.com/api/messages/${messageId}/replies`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, content })
                    });
                    if (!response.ok) throw new Error("Erreur lors de l'envoi de la réponse.");

                    replyInput.remove();
                    sendButton.remove();
                    alert("Réponse envoyée avec succès."); // Afficher une confirmation d'envoi
                } catch (error) {
                    console.error(error);
                    alert("Erreur lors de l'envoi de la réponse.");
                }
            });
        }
    });

    // Récupérer les informations de l'utilisateur lors du chargement de la page
    getUserInfo();
});
