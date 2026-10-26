// ============================================================================
// HotelHub Chatbot Controller & AI Agent UI Bridge
// ============================================================================

let recognition;
let isListening = false;

// Initialize chatbot
document.addEventListener("DOMContentLoaded", function() {
    // Chat icon click handler
    const chatIcon = document.getElementById("chatIcon");
    if (chatIcon) {
        chatIcon.addEventListener("click", toggleChat);
    }
    
    // Send button handler
    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }
    
    // Enter key handler
    const userInput = document.getElementById("userInput");
    if (userInput) {
        userInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
    
    // Voice input setup
    setupVoiceRecognition();
});

// Toggle chat window
function toggleChat() {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return;

    if (chatBox.style.display === "flex") {
        closeChat();
    } else {
        chatBox.style.display = "flex";
        setTimeout(() => {
            const input = document.getElementById("userInput");
            if (input) input.focus();
        }, 100);
    }
}

// Close chat
function closeChat() {
    const chatBox = document.getElementById("chatBox");
    if (chatBox) chatBox.style.display = "none";
    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
    }
}

// Send message & trigger AI Agent workflow
async function sendMessage() {
    const userInput = document.getElementById("userInput");
    if (!userInput) return;
    const message = userInput.value.trim();
    
    if (message === "") return;
    
    // Add user message to chat UI
    addMessageToChat(escapeHtml(message), "user");
    userInput.value = "";
    
    // Show AI Thinking / Tool Execution indicator
    const typingId = showTypingIndicator();

    try {
        let responseHtml = "";

        if (window.HotelHubAgent && typeof window.HotelHubAgent.interpretAndExecute === "function") {
            const agentResult = await window.HotelHubAgent.interpretAndExecute(message);
            responseHtml = agentResult.html;
        } else {
            responseHtml = "HotelHub Agent is loading, please try again in a moment.";
        }

        removeTypingIndicator(typingId);
        addMessageToChat(responseHtml, "bot");
        speakMessage(responseHtml);

    } catch (err) {
        console.error("AI Agent error:", err);
        removeTypingIndicator(typingId);
        addMessageToChat("⚠️ An error occurred while executing the agent workflow. Please try again.", "bot");
    }
}

// Typing / Tool execution indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById("chatMessages");
    const id = "typing-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.className = "bot-message";
    div.innerHTML = `
        <img src="images/chatbot-avatar.png" alt="AI Assistant" class="chatbot-avatar">
        <div class="message-content" style="color: #64748b; font-style: italic; font-size: 13px;">
            🤖 AI Agent analyzing intent & tools...
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
}

// Add message to chat container
function addMessageToChat(contentHtml, sender) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `${sender}-message`;
    
    if (sender === "bot") {
        messageDiv.innerHTML = `
            <img src="images/chatbot-avatar.png" alt="AI Assistant" class="chatbot-avatar">
            <div class="message-content">${contentHtml}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${contentHtml}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Voice recognition setup (Web Speech API)
function setupVoiceRecognition() {
    const voiceBtn = document.getElementById("voiceBtn");
    if (!voiceBtn) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isListening = true;
            voiceBtn.style.background = "#ff4444";
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById("userInput").value = transcript;
            isListening = false;
            voiceBtn.style.background = "#ff6600";
            setTimeout(sendMessage, 400);
        };
        
        recognition.onerror = function() {
            isListening = false;
            voiceBtn.style.background = "#ff6600";
        };
        
        recognition.onend = function() {
            isListening = false;
            voiceBtn.style.background = "#ff6600";
        };
        
        voiceBtn.addEventListener("click", function() {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        voiceBtn.style.display = "none";
    }
}

// Text-to-speech for responses
function speakMessage(messageHtml) {
    if ('speechSynthesis' in window) {
        // Strip HTML tags for voice output
        const cleanMessage = messageHtml.replace(/<[^>]*>/g, '').trim();
        // Speak only the first sentence to avoid reading long data tables
        const firstSentence = cleanMessage.split('.')[0] + '.';

        const utterance = new SpeechSynthesisUtterance(firstSentence);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Global exposure
window.sendMessage = sendMessage;
window.toggleChat = toggleChat;
window.closeChat = closeChat;