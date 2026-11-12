/* L'Oreal Beauty Assistant */

// HTML elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");
const sendBtn = document.getElementById("sendBtn");

// Cloudflare Worker connection
const WORKER_URL = "https://loreal-beauty-chatbot.bxm3289.workers.dev";

// Conversation history
const conversationHistory = [
  {
    role: "system",
    content: `You are L'Oreal Beauty Assistant.

    Only answer questions about L'Oreal products, skincare,
    haircare, makeup, beauty routines, and beauty recommendations.

    Politely refuse unrelated questions and redirect users
    to beauty-related topics.

    Remember the user's name and previous questions throughout
    the conversation.

    Be friendly, professional, helpful, and concise.
    Never invent product ingredients or medical claims.`,
  },
];

// Display messages
function addMessage(role, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", role);

  const label = document.createElement("strong");
  label.textContent = role === "user" ? "You" : "L'Oreal Beauty Assistant";

  const text = document.createElement("p");
  text.textContent = message;

  messageDiv.appendChild(label);
  messageDiv.appendChild(text);

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Initial greeting
addMessage(
  "assistant",
  "Welcome to L'Oreal Beauty Assistant! 💄 What's your name, and how can I help you with your beauty routine today?",
);

// Handle user questions
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();

  if (!question) return;

  // Show latest question
  latestQuestion.style.display = "block";
  latestQuestion.replaceChildren();

  const questionLabel = document.createElement("strong");
  questionLabel.textContent = "YOUR LATEST QUESTION";

  const questionText = document.createElement("p");
  questionText.textContent = question;

  latestQuestion.appendChild(questionLabel);
  latestQuestion.appendChild(questionText);

  // Display user message
  addMessage("user", question);

  // Save conversation
  conversationHistory.push({
    role: "user",
    content: question,
  });

  userInput.value = "";
  sendBtn.disabled = true;
  sendBtn.textContent = "WAIT";

  // Loading indicator
  const loading = document.createElement("p");
  loading.textContent = "Your beauty assistant is thinking...";
  chatWindow.appendChild(loading);

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to connect to OpenAI.");
    }

    const botReply = data.choices?.[0]?.message?.content;

    if (!botReply) {
      throw new Error("No chatbot response was received.");
    }

    // Save assistant response
    conversationHistory.push({
      role: "assistant",
      content: botReply,
    });

    loading.remove();

    // Display assistant response
    addMessage("assistant", botReply);
  } catch (error) {
    loading.remove();

    console.error("Chatbot error:", error);

    addMessage(
      "assistant",
      "I'm sorry! I'm having trouble connecting. Please try again.",
    );
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "SEND";
    userInput.focus();
  }
});
