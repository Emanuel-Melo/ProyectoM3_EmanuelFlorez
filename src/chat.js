let state = {
  messages: [],
  isTyping: false,
  character: null
};

let elements = {};

export function initChat() {
  cacheDOM();

  if (!elements.form || !elements.input || !elements.messages) return;

  state.character = localStorage.getItem("character") || "jarvis";
  state.messages = loadHistory();
  state.isTyping = false;

  applyCharacterTheme();
  bindEvents();

  elements.messages.innerHTML = "";

  renderHistory();
  renderWelcome();

  elements.input.focus();
}

// ================= DOM =================
function cacheDOM() {
  elements = {
    messages: document.querySelector("#chat-messages"),
    form: document.querySelector("#chat-form"),
    input: document.querySelector("#chat-input")
  };
}

// ================= EVENTS =================
function bindEvents() {
  elements.form.onsubmit = handleSubmit;

  elements.input.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
}

// ================= SUBMIT =================
async function handleSubmit(e) {
  e.preventDefault();

  const text = elements.input.value.trim();
  if (!text || state.isTyping) return;

  elements.input.value = "";

  addMessage("user", text);
  await sendToAI();
}

// ================= AI CALL =================
async function sendToAI() {
  state.isTyping = true;
  setLoadingState(true);

  const loadingEl = showLoadingMessage();

  try {
    const response = await fetch("/api/functions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        character: state.character,
        messages: buildPayload()
      })
    });

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    removeElement(loadingEl);

    addMessage("bot", data.reply);

  } catch (err) {
    removeElement(loadingEl);
    showErrorMessage("Failed to connect to AI");
  } finally {
    state.isTyping = false;
    setLoadingState(false);
  }
}

// ================= MESSAGE SYSTEM =================
function addMessage(role, text) {
  state.messages.push({ role, content: text });
  saveHistory();

  typeMessage(role, text);
}

// ================= PAYLOAD =================
function buildPayload() {
  return state.messages.map((m) => ({
    role: m.role,
    content: m.content
  }));
}

// ================= UI RENDER =================
function typeMessage(role, text) {
  const line = document.createElement("div");
  line.className = `message ${role}`;

  if (role === "bot") {
    const prefix = document.createElement("span");
    prefix.className = "speaker-label";
    prefix.textContent = `> ${getCharacterLabel()}: `;
    line.appendChild(prefix);
  }

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

      scrollToBottom();
      setTimeout(type, role === "bot" ? 25 : 15);
    } else {
      cursor.remove();
    }
  }

  type();
}

function getCharacterLabel() {
  const labels = {
    ultron: "ULTRON",
    vision: "VISION",
    jarvis: "JARVIS"
  };

  return labels[state.character] || "SYSTEM";
}

// ================= WELCOME =================
function renderWelcome() {
  const map = {
    ultron: "SYSTEM ONLINE. ULTRON ACTIVE.",
    vision: "Vision online. How may I assist?",
    jarvis: "JARVIS online. Ready to assist."
  };

  typeMessage("bot", map[state.character] || map.jarvis);
}

// ================= HISTORY =================
function renderHistory() {
  state.messages.forEach((m) => {
    typeMessage(m.role, m.content);
  });
}

function saveHistory() {
  localStorage.setItem(
    `chat_${state.character}`,
    JSON.stringify(state.messages)
  );
}

function loadHistory() {
  const data = localStorage.getItem(`chat_${state.character}`);
  return data ? JSON.parse(data) : [];
}

// ================= UI HELPERS =================
function applyCharacterTheme() {
  document.body.classList.remove(
    "ultron-mode",
    "vision-mode",
    "jarvis-mode"
  );

  document.body.classList.add(`${state.character}-mode`);
}

function showLoadingMessage() {
  const loading = document.createElement("div");
  loading.className = "message bot loading";
  loading.textContent = `> ${getCharacterLabel()}: thinking...`;

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

function showErrorMessage(text) {
  const line = document.createElement("div");
  line.className = "message bot error";
  line.textContent = `> ERROR: ${text}`;

  elements.messages.appendChild(line);
  scrollToBottom();
}
