let state = {
  messages: [],
  isTyping: false,
  character: null
};

let elements = {};
let isBound = false;

export function initChat() {
  cacheDOM();

  if (!elements.form || !elements.input || !elements.messages) return;

  const savedCharacter = localStorage.getItem("character");
  state.character = savedCharacter || "jarvis";
  state.messages = [];
  state.isTyping = false;

  applyCharacterTheme();

  if (!isBound) {
    bindEvents();
    isBound = true;
  }

  elements.messages.innerHTML = "";
  renderWelcome();
  elements.input.focus();
}

function cacheDOM() {
  elements = {
    container: document.querySelector("#chat-container"),
    messages: document.querySelector("#chat-messages"),
    form: document.querySelector("#chat-form"),
    input: document.querySelector("#chat-input")
  };
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

  elements.input.value = "";
  simulateConversation(text);
}

function simulateConversation(userText) {
  state.isTyping = true;
  setLoadingState(true);

  typeMessage("user", userText, () => {
    const loadingEl = showLoadingMessage();

    setTimeout(() => {
      removeElement(loadingEl);

      const response = generateMockResponse();

      typeMessage("bot", response, () => {
        state.isTyping = false;
        setLoadingState(false);
      });

    }, getTypingDelay());
  });
}

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
      const char = text[i];
      output += char;
      content.textContent = output;

      i++;

      let delay = role === "bot" ? 35 : 20;

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

function renderWelcome() {
  const welcomeMap = {
    ultron: "SYSTEM ONLINE. YOU ARE NOW CONNECTED TO ULTRON.",
    vision: "Greetings. I am Vision. How may I assist you?",
    jarvis: "Good day. JARVIS at your service."
  };

  const text = welcomeMap[state.character] || welcomeMap.jarvis;
  typeMessage("bot", text);
}

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

function applyCharacterTheme() {
  document.body.classList.remove("ultron-mode", "vision-mode", "jarvis-mode");
  document.body.classList.add(`${state.character}-mode`);
}

function showLoadingMessage() {
  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.textContent = "> SYSTEM";

  elements.messages.appendChild(loading);
  scrollToBottom();

  return loading;
}

function removeElement(el) {
  if (el?.parentNode) el.parentNode.removeChild(el);
}

function setLoadingState(isLoading) {
  elements.form.classList.toggle("loading", isLoading);
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  });
}

function getTypingDelay() {
  switch (state.character) {
    case "ultron": return 600;
    case "vision": return 1400;
    case "jarvis": return 900;
    default: return 1000;
  }
}

function showErrorMessage(text) {
  const line = document.createElement("div");
  line.className = "message bot error";
  line.textContent = `> ERROR: ${text}`;

  elements.messages.appendChild(line);
  scrollToBottom();
}