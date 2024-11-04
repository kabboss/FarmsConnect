
     const socket = io();

        const startButton = document.getElementById('startLive');
        const liveVideo = document.getElementById('liveVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const statusDiv = document.getElementById('status');

        // Nom d'utilisateur (ajusté en fonction de l'utilisateur actuel)
        const username = prompt("Entrez votre nom d'utilisateur");

        // Seuls "farmsconnect" verra le bouton de démarrage du live
        if (username === 'farmsconnect.admin') {
            startButton.style.display = 'block';
        }

        // Démarrage du live par farmsconnect
        startButton.addEventListener('click', async () => {
            socket.emit('start-live', username);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                liveVideo.srcObject = stream;

                stream.getTracks().forEach(track => {
                    socket.emit('stream-data', track);
                });
            } catch (error) {
                console.error('Erreur lors de la capture de l\'audio/vidéo:', error);
            }
        });

        // Recevoir et afficher le flux de "farmsconnect" pour les spectateurs
        socket.on('stream', (data) => {
            const remoteStream = new MediaStream([data]);
            remoteVideo.srcObject = remoteStream;
        });

        // Messages pour les événements de live
        socket.on('live-started', (host) => {
            statusDiv.innerText = `Live démarré par ${host}`;
        });

        socket.on('live-ended', () => {
            statusDiv.innerText = "Le live est terminé.";
            remoteVideo.srcObject = null;
        });

        socket.on('live-already-active', (message) => {
            alert(message);
        });

        socket.on('not-authorized', (message) => {
            alert(message);
        });




        import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
function App() {
    const [isLive, setIsLive] = useState(false);
    const [messages, setMessages] = useState([]);
    const videoRef = useRef(null);

    useEffect(() => {
        socket.on('liveStarted', (data) => {
            setIsLive(true);
            setMessages((prev) => [...prev, data.message]);
            startStreaming();
        });

        socket.on('liveEnded', (data) => {
            setIsLive(false);
            setMessages((prev) => [...prev, data.message]);
            stopStreaming();
        });

        socket.on('joinSuccess', (data) => {
            setMessages((prev) => [...prev, data.message]);
        });

        socket.on('joinFailure', (data) => {
            setMessages((prev) => [...prev, data.message]);
        });

        return () => {
            socket.off('liveStarted');
            socket.off('liveEnded');
            socket.off('joinSuccess');
            socket.off('joinFailure');
        };
    }, []);

    const startStreaming = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            })
            .catch((error) => console.error("Erreur lors de l'accès à la caméra : ", error));
    };

    const stopStreaming = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
    };

    const handleJoin = () => {
        socket.emit('joinLive');
    };

    const handleStartLive = () => {
        socket.emit('startLive', { user: 'FarmsConnect' });
    };

    const handleEndLive = () => {
        socket.emit('endLive', { user: 'FarmsConnect' });
    };

    return (
        <div className="App">
            <h1>FarmsConnect Formation Live</h1>
            <video ref={videoRef} autoPlay muted style={{ width: '600px', height: '400px' }}></video>
            <div>
                {isLive ? (
                    <button onClick={handleEndLive}>Terminer le Live</button>
                ) : (
                    <button onClick={handleStartLive}>Démarrer le Live</button>
                )}
                <button onClick={handleJoin}>Rejoindre le Live</button>
            </div>
            <div>
                <h2>Messages</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
