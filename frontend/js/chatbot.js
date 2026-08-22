// Chatbot functionality
let recognition;
let isListening = false;

// Initialize chatbot
document.addEventListener("DOMContentLoaded", function() {
    // Chat icon click handler
    document.getElementById("chatIcon").addEventListener("click", toggleChat);
    
    // Send button handler
    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    
    // Enter key handler
    document.getElementById("userInput").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
    
    // Voice input setup
    setupVoiceRecognition();
});

// Toggle chat window
function toggleChat() {
    const chatBox = document.getElementById("chatBox");
    if (chatBox.style.display === "flex") {
        closeChat();
    } else {
        chatBox.style.display = "flex";
        // Focus on input when opening
        setTimeout(() => {
            document.getElementById("userInput").focus();
        }, 100);
    }
}

// Close chat
function closeChat() {
    document.getElementById("chatBox").style.display = "none";
    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
    }
}

// Send message
function sendMessage() {
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();
    
    if (message === "") return;
    
    // Add user message to chat
    addMessageToChat(message, "user");
    userInput.value = "";
    
    // Process and get bot response
    setTimeout(() => {
        const botResponse = processUserMessage(message);
        addMessageToChat(botResponse, "bot");
        
        // Speak the response
        speakMessage(botResponse);
    }, 1000);
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `${sender}-message`;
    
    if (sender === "bot") {
        messageDiv.innerHTML = `
            <img src="images/chatbot-avatar.png" alt="AI Assistant" class="chatbot-avatar">
            <div class="message-content">${message}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Process user message and generate response
function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
        return "Hello! How can I help you with your hotel booking today?";
    }
    
    // Hotel search
    if (lowerMessage.includes("hotel") || lowerMessage.includes("find") || lowerMessage.includes("search")) {
        if (lowerMessage.includes("miami")) {
            return "I found several great hotels in Miami! <a href='search.html?city=Miami' style='color: #ff6600;'>Click here to view Miami hotels</a>.";
        } else if (lowerMessage.includes("new york")) {
            return "There are many excellent hotels in New York! <a href='search.html?city=New York' style='color: #ff6600;'>Click here to view New York hotels</a>.";
        } else if (lowerMessage.includes("denver")) {
            return "I can help you find hotels in Denver! <a href='search.html?city=Denver' style='color: #ff6600;'>Click here to view Denver hotels</a>.";
        } else {
            return "I can help you find hotels in various cities. Which city are you interested in? You can also <a href='search.html' style='color: #ff6600;'>browse all hotels here</a>.";
        }
    }
    
    // Booking questions
    if (lowerMessage.includes("book") || lowerMessage.includes("reservation")) {
        return "To book a hotel, simply go to the search page, select your preferred hotel, choose your dates, and proceed with the booking. <a href='search.html' style='color: #ff6600;'>Start your search here</a>.";
    }
    
    // Price questions
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("expensive")) {
        return "Hotel prices vary based on location, season, and amenities. Our prices start from $99 per night. You can filter by price on our search page.";
    }
    
    // Amenities
    if (lowerMessage.includes("wifi") || lowerMessage.includes("pool") || lowerMessage.includes("breakfast")) {
        return "Most of our hotels offer free WiFi, swimming pools, and breakfast options. You can see specific amenities for each hotel on their detail page.";
    }
    
    // Payment
    if (lowerMessage.includes("payment") || lowerMessage.includes("pay") || lowerMessage.includes("credit card")) {
        return "We accept all major credit cards, PayPal, and Google Pay. Your payment information is securely encrypted.";
    }
    
    // Cancellation
    if (lowerMessage.includes("cancel") || lowerMessage.includes("refund")) {
        return "Our cancellation policy varies by hotel. Most hotels offer free cancellation up to 24 hours before check-in. Please check the specific hotel's policy during booking.";
    }
    
    // Default response
    return "I'm here to help with hotel bookings! You can ask me about:<br>" +
           "• Finding hotels in specific cities<br>" +
           "• Booking process<br>" +
           "• Prices and amenities<br>" +
           "• Payment options<br>" +
           "Or you can <a href='search.html' style='color: #ff6600;'>browse all hotels directly</a>.";
}

// Voice recognition setup
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isListening = true;
            document.getElementById("voiceBtn").style.background = "#ff4444";
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById("userInput").value = transcript;
            isListening = false;
            document.getElementById("voiceBtn").style.background = "#ff6600";
            
            // Auto-send after voice input
            setTimeout(sendMessage, 500);
        };
        
        recognition.onerror = function(event) {
            console.error("Speech recognition error", event.error);
            isListening = false;
            document.getElementById("voiceBtn").style.background = "#ff6600";
        };
        
        recognition.onend = function() {
            isListening = false;
            document.getElementById("voiceBtn").style.background = "#ff6600";
        };
        
        document.getElementById("voiceBtn").addEventListener("click", function() {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        // Voice recognition not supported
        document.getElementById("voiceBtn").style.display = "none";
    }
}

// Text-to-speech
function speakMessage(message) {
    if ('speechSynthesis' in window) {
        // Remove HTML tags for speech
        const cleanMessage = message.replace(/<[^>]*>/g, '');
        
        const utterance = new SpeechSynthesisUtterance(cleanMessage);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
    }
}