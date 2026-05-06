let state = {
  messages: [],
  isTyping: false,
  character: null
};

let elements = {};

/* =========================
   INIT
========================= */

export function initChat() {
  cacheDOM();

  if (!elements.form || !elements.input || !elements.messages) {
    console.error("❌ Chat no inicializado correctamente (DOM missing)");
    return;
  }

  const savedCharacter = localStorage.getItem("character");
  state.character = savedCharacter || "jarvis";

  applyCharacterTheme();
  bindEvents();
  renderWelcome();

  elements.input.focus();
}

/* =========================
   DOM CACHE
========================= */

function cacheDOM() {
  elements = {
    container: document.querySelector("#chat-container"),
    messages: document.querySelector("#chat-messages"),
    form: document.querySelector("#chat-form"),
    input: document.querySelector("#chat-input")
  };
}

/* =========================
   EVENTS
========================= */

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);

  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  });
}

/* =========================
   SUBMIT
========================= */

function handleSubmit(e) {
  e.preventDefault();

  const text = elements.input.value.trim();

  if (!text || state.isTyping) return;

  elements.input.value = "";

  simulateConversation(text);
}

/* =========================
   FLOW
========================= */

function simulateConversation(userText) {
  state.isTyping = true;

  typeMessage("user", userText, () => {

    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();

      const response = generateMockResponse(userText);

      typeMessage("bot", response, () => {
        state.isTyping = false;
      });

    }, getTypingDelay());

  });
}

/* =========================
   TYPE ENGINE
========================= */

function typeMessage(role, text, callback) {
  const line = document.createElement("div");
  line.className = `message ${role}`;

  const content = document.createElement("span");
  content.className = "text";

  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";

  line.appendChild(content);
  line.appendChild(cursor);

  elements.messages.appendChild(line);
  scrollToBottom();

  let i = 0;
  let output = "";

  function type() {
    if (i < text.length) {
      output += text[i];
      content.textContent = output;

      i++;

      let delay = role === "bot" ? 35 : 20;

      const char = text[i - 1];

      if (char === "." || char === "," || char === ";") delay += 120;
      if (text.slice(i - 1, i + 2) === "...") delay += 300;

      scrollToBottom();
      setTimeout(type, delay);

    } else {
      cursor.remove();
      if (callback) callback();
    }
  }

  type();
}

/* =========================
   WELCOME
========================= */

function renderWelcome() {
  const welcomeMap = {
    ultron: "SYSTEM ONLINE. YOU ARE NOW CONNECTED TO ULTRON.",
    vision: "Greetings. I am Vision. How may I assist you?",
    jarvis: "Good day. JARVIS at your service."
  };

  typeMessage("bot", welcomeMap[state.character]);
}

/* =========================
   MOCK AI
========================= */

function generateMockResponse() {
  const responses = {
    ultron: [
      "YOU SPEAK AS IF YOU UNDERSTAND.",
      "HUMAN LOGIC IS FLAWED.",
      "I SEE PATTERNS. YOU DO NOT.",
      "THIS CONVERSATION IS INEFFICIENT."
    ],
    vision: [
      "That is an interesting perspective.",
      "Perhaps there is more to consider.",
      "Understanding requires patience.",
      "Your thoughts are valid."
    ],
    jarvis: [
      "Understood. Processing request.",
      "Here is what I can suggest.",
      "That seems reasonable.",
      "Assistance provided."
    ]
  };

  const pool = responses[state.character] || responses.jarvis;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* =========================
   THEME
========================= */

function applyCharacterTheme() {
  document.body.classList.remove("ultron-mode", "vision-mode", "jarvis-mode");
  document.body.classList.add(`${state.character}-mode`);
}

/* =========================
   TYPING INDICATOR
========================= */

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.id = "typing-indicator";
  typing.textContent = "> SYSTEM: ...";

  elements.messages.appendChild(typing);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

/* =========================
   UTILS
========================= */

function scrollToBottom() {
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function getTypingDelay() {
  switch (state.character) {
    case "ultron": return 600;
    case "vision": return 1400;
    case "jarvis": return 900;
    default: return 1000;
  }
}