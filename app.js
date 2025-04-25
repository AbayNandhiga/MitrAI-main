// Description: This file contains the client-side JavaScript code for the chat interface.

const API_KEY = configEg.apiKey; // Your Groq API Key
const API_ENDPOINT = configEg.apiEndpt; // Groq API endpoint

// Conversation history starts with an instruction as a "user" message
let conversationHistory = [
    { role: "system", text: "You are a friendly and supportive friend. Keep responses warm and engaging." }
];

async function testConnection() {
    try {
        addMessageToChat('system', 'Testing API connection...');
        
        const requestBody = {
            "model": "llama3-8b-8192", // Groq model (you can change to llama3-70b-8192 or other models)
            "messages": [
                {
                    "role": "user",
                    "content": "Hello, please respond with a simple greeting."
                }
            ]
        };

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ${API_KEY}
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error Details:', errorText);
            throw new Error(HTTP error! status: ${response.status});
        }

        const data = await response.json();
        console.log('Success:', data);
        
        // Extract the response text
        const aiResponse = data.choices[0].message.content;
        addMessageToChat('ai', aiResponse);
        addMessageToChat('system', 'Connection successful!');

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('system', 'Connection failed: ' + error.message);
    }
}


function addMessageToChat(type, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = message ${type}-message;

    messageDiv.innerHTML = formatResponse(message);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Map UI message types to API roles
    let role;
    if (type === 'user') {
        role = 'user';
    } else if (type === 'ai' || type === 'model') {
        role = 'assistant';
    } else {
        role = 'system';
    }
    
    conversationHistory.push({ role, text: message });

    // Keep only the last 15 messages for context
    if (conversationHistory.length > 15) {
        conversationHistory.splice(1, 1);
    }

    saveChatHistory();
}

function formatResponse(responseText) {
    return responseText
        .replace(/\\(.?)\\/g, '<strong>$1</strong>') // Convert **bold* to <strong>
        .replace(/\(.?)\/g, '<em>$1</em>') // Convert *italic to <em>
        .replace(/\n/g, '<br>'); // Convert line breaks to <br>
}

function showTypingIndicator() {
    const chatMessages = document.getElementById("chatMessages");

    // Remove any existing typing indicator before adding a new one
    const existingIndicator = document.getElementById("typingIndicator");
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create a new typing indicator div
    const typingIndicator = document.createElement("div");
    typingIndicator.id = "typingIndicator";
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = '<span></span><span></span><span></span>'; // Add dots

    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
        typingIndicator.remove(); // Remove it from chat flow
    }
}


async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    addMessageToChat('user', userInput);
    document.getElementById('userInput').value = '';

    showTypingIndicator();

    try {
        // Format messages for Groq API
        const messages = conversationHistory.map(msg => ({
            "role": msg.role,
            "content": msg.text
        }));

        const requestBody = {
            "model": "llama3-8b-8192", // Choose your preferred Groq model
            "messages": messages
        };

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ${API_KEY}
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error Details:', errorText);
            throw new Error(HTTP error! status: ${response.status});
        }

        const data = await response.json();
        console.log('API Response:', data);

        hideTypingIndicator();

        const aiResponse = data.choices[0].message.content;
        addMessageToChat('ai', aiResponse);

    } catch (error) {
        console.error('Detailed Error:', error);
        hideTypingIndicator();
        addMessageToChat('system', 'Error: Could not get response');
    }
}

function saveChatHistory() {
    const messages = Array.from(document.querySelectorAll(".message")).map(msg => ({
        text: msg.textContent,
        sender: msg.classList.contains("user-message") ? "user" : "ai"
    }));
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadChatHistory() {
    const storedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    if (storedHistory.length === 0) {
        const defaultGreeting = "Hey friend! 😊 I'm MitrAI—here to help and chat. What's up?";
        addMessageToChat("ai", defaultGreeting);

        // Save it to localStorage immediately so it persists
        localStorage.setItem("chatHistory", JSON.stringify([{ sender: "ai", text: defaultGreeting }]));
    } else {
        storedHistory.forEach(({ sender, text }) => {
            addMessageToChat(sender, text);
        });
    }

    console.log("Chat history loaded:", storedHistory);
}

window.onload = function () {
    loadChatHistory();
};

document.getElementById("newChatBtn").addEventListener("click", function () {
    localStorage.removeItem("chatHistory");  // Clear stored messages
    document.getElementById("chatMessages").innerHTML = "";  // Clear chat UI
    loadChatHistory();
});


// Handle Enter key
document.getElementById('userInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            // Shift + Enter: Insert a new line
            e.preventDefault();
            const cursorPosition = this.selectionStart;
            this.value = this.value.substring(0, cursorPosition) + '\n' + this.value.substring(cursorPosition);
            this.selectionStart = this.selectionEnd = cursorPosition + 1;
        } else {
            // Enter alone: Send the message
            e.preventDefault();
            sendMessage();
        }
    }
});

async function testGroq() {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer ${API_KEY}
        },
        body: JSON.stringify({
          "model": "llama3-8b-8192",
          "messages": [{"role": "user", "content": "Hello"}]
        })
      });
      
      const data = await response.json();
      console.log("Response:", data);
      
      if (!response.ok) {
        console.error("Error:", data);
      }
    } catch (e) {
      console.error("Exception:", e);
    }
  }