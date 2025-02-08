const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyDBhDz2rKxqpdsv-IsjV6KFyvK9ZVPGPsg"; // Your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

const inputInitHeight = chatInput.scrollHeight;

// Function to create chat list items
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

// Function to update "Thinking..."  
const updateThinkingMessage = (messageElement) => {
    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots + 1) % 4; // Cycle through 0-3 dots
        messageElement.textContent = "Thinking" + ".".repeat(dots);
    }, 500);

}

// Function to generate API response
const generateAPIResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    try {
        // Send a POST request to the API with the modified user message and a prompt for a short response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: `${userMessage}. Please provide a short response.` }]
                }]
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Get the API response text
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
        
        // Truncate the response to ensure it is short (for example, limit to 100 words)
        apiResponse = apiResponse.split(" ").slice(0, 100).join(" ") + (apiResponse.split(" ").length > 100 ? "..." : "");

        messageElement.innerHTML = apiResponse; // Use innerHTML to allow rendering of markdown
    } catch (error) {
        messageElement.textContent = `Error: ${error.message}`;
        chatElement.classList.add("error");
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

// Function to handle user input and responses
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage || isResponseGenerating) return;

    // Filter to respond only to book-related queries
    const bookKeywords = ["book", "author", "title", "read", "recommend", "novel", "story"];
    const containsBookKeyword = bookKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

    if (!containsBookKeyword) {
        // If the message doesn't contain book-related keywords, return without sending a request
        chatbox.appendChild(createChatLi("Sorry, I can only respond to book-related queries.", "incoming"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        return;
    }

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Call the API to get the response
        generateAPIResponse(incomingChatLi);
    }, 600);
}

// Event listeners for chat input and button clicks
chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
