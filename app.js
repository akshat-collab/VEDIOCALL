// Peer-to-peer connection state
let peerConnection;

// DOM Elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message');
const messagesDiv = document.getElementById('messages');
const startCallButton = document.getElementById('start-call');
const shareLinkButton = document.getElementById('share-link');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const emojiButton = document.getElementById('emoji-button');
const modal = document.getElementById('link-modal');
const inviteLinkInput = document.getElementById('invite-link');
const copyLinkButton = document.getElementById('copy-link');
const closeButton = document.querySelector('.close');
const participantsCount = document.getElementById('participants');

// Generate a random room ID and username
const roomId = generateRoomId();
let currentUser = generateRandomUsername();
let participants = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    initVideoCall();
    initLinkSharing();
    updateParticipantsCount();
});

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
}

function generateRandomUsername() {
    const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Gentle'];
    const nouns = ['Tiger', 'Dolphin', 'Eagle', 'Panda', 'Wolf'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

function initChat() {
    // Load previous messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        messagesDiv.innerHTML = savedMessages;
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Emoji picker
    emojiButton.addEventListener('click', () => {
        const emoji = prompt('Select an emoji:');
        if (emoji) {
            messageInput.value += emoji;
            messageInput.focus();
        }
    });
}

function initVideoCall() {
    startCallButton.addEventListener('click', async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            
            // Create peer connection
            peerConnection = new RTCPeerConnection(configuration);
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                remoteVideo.srcObject = event.streams[0];
            };

            // Create offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            console.log('Offer created:', offer);
            
        } catch (error) {
            console.error('Error starting call:', error);
        }
    });
}

function initLinkSharing() {
    // Show modal when share button is clicked
    shareLinkButton.addEventListener('click', () => {
        const dataUrl = `data:text/html,<html><body><script>
            localStorage.setItem('joinRoom', '${roomId}');
            window.close();
        </script></body></html>`;
        inviteLinkInput.value = dataUrl;
        modal.style.display = 'block';
    });

    // Close modal when X is clicked
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Copy link to clipboard
    copyLinkButton.addEventListener('click', () => {
        inviteLinkInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });

    // Check for room ID in localStorage
    const joinRoom = localStorage.getItem('joinRoom');
    if (joinRoom) {
        participants = 2;
        updateParticipantsCount();
        addSystemMessage(`${currentUser} has joined the chat`);
        localStorage.removeItem('joinRoom');
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        const timestamp = new Date().toLocaleTimeString();
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <strong>${currentUser}</strong> [${timestamp}]: ${message}
        `;
        messagesDiv.appendChild(messageElement);
        
        // Save to localStorage
        localStorage.setItem('chatMessages', messagesDiv.innerHTML);
        
        messageInput.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system';
    messageElement.textContent = text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateParticipantsCount() {
    participantsCount.textContent = `${participants} participant${participants !== 1 ? 's' : ''}`;
}

// WebRTC configuration
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Variables for WebRTC
let localStream;
