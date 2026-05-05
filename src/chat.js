// chat.js

let state = {
  messages: [],
  isTyping: false,
  character: null
};

let elements = {};

export function initChat() {
  elements = {
    container: document.querySelector("#chat-container"),
    messages: document.querySelector("#chat-messages"),
    form: document.querySelector("#chat-form"),
    input: document.querySelector("#chat-input")
  };

  const savedCharacter = JSON.parse(localStorage.getItem("selectedCharacter"));
  state.character = savedCharacter || "jarvis";

  applyCharacterTheme();

  bindEvents();
  renderWelcome();
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);

  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  });
}

function handleSubmit(e) {
  e.preventDefault();

  const text = elements.input.value.trim();
  if (!text || state.isTyping) return;

  addMessage("user", text);
  elements.input.value = "";

  simulateResponse(text);
}

function addMessage(role, text) {
  const message = {
    id: Date.now(),
    role,
    text
  };

  state.messages.push(message);
  renderMessage(message);
  scrollToBottom();
}

function renderMessage(message) {
  const bubble = document.createElement("div");
  bubble.className = `message ${message.role}`;

  const content = document.createElement("div");
  content.className = "bubble";
  content.textContent = message.text;

  bubble.appendChild(content);
  elements.messages.appendChild(bubble);
}

function renderWelcome() {
  const welcomeMap = {
    ultron: "SYSTEM ONLINE. YOU ARE NOW CONNECTED TO ULTRON.",
    vision: "Greetings. I am Vision. How may I assist you?",
    jarvis: "Good day. JARVIS at your service."
  };

  addMessage("bot", welcomeMap[state.character]);
}

function simulateResponse(userText) {
  state.isTyping = true;
  showTypingIndicator();

  const delay = getTypingDelay();

  setTimeout(() => {
    removeTypingIndicator();

    const response = generateMockResponse(userText);
    addMessage("bot", response);

    state.isTyping = false;
  }, delay);
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.id = "typing-indicator";

  typing.innerHTML = `<div class="bubble">...</div>`;
  elements.messages.appendChild(typing);

  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

function scrollToBottom() {
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function getTypingDelay() {
  switch (state.character) {
    case "ultron":
      return 600;
    case "vision":
      return 1400;
    case "jarvis":
      return 900;
    default:
      return 1000;
  }
}

function generateMockResponse(input) {
  const responses = {
    ultron: [
      "YOU SPEAK AS IF YOU UNDERSTAND.",
      "HUMAN LOGIC IS... FLAWED.",
      "I SEE PATTERNS. YOU DO NOT.",
      "THIS CONVERSATION IS INEFFICIENT."
    ],
    vision: [
      "That is an interesting perspective.",
      "Perhaps there is more to consider.",
      "I believe understanding requires patience.",
      "Your thoughts are valid."
    ],
    jarvis: [
      "Understood. Processing your request.",
      "Here is what I can suggest.",
      "That seems reasonable.",
      "Allow me to assist you further."
    ]
  };

  const pool = responses[state.character] || responses.jarvis;
  return pool[Math.floor(Math.random() * pool.length)];
}

function applyCharacterTheme() {
  document.body.classList.remove("ultron-mode", "vision-mode", "jarvis-mode");
  document.body.classList.add(`${state.character}-mode`);
}