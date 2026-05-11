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
  renderChatControls();
  bindEvents();
  updateHistoryIndicator();

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
    input: document.querySelector("#chat-input"),
    header: document.querySelector("#chat-header")
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

  const clearButton = document.getElementById("clear-history-btn");
  if (clearButton) {
    clearButton.onclick = clearHistory;
  }
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
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        character: state.character,
        messages: buildPayload()
      })
    });

    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(data?.reply || `API error ${response.status}`);
    }

    removeElement(loadingEl);

    addMessage("bot", data.reply);

  } catch (err) {
    removeElement(loadingEl);
    showErrorMessage(err?.message || "Failed to connect to AI");
  } finally {
    state.isTyping = false;
    setLoadingState(false);
  }
}

async function parseApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return {
      reply: `Empty response from API (${response.status})`
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      reply: text
    };
  }
}

// ================= MESSAGE SYSTEM =================
function addMessage(role, text) {
  state.messages.push({
    role,
    content: text,
    timestamp: new Date().toISOString()
  });
  saveHistory();
  updateHistoryIndicator();

  typeMessage(role, text, state.messages[state.messages.length - 1].timestamp);
}

// ================= PAYLOAD =================
function buildPayload() {
  return state.messages.map((m) => ({
    role: m.role,
    content: m.content
  }));
}

// ================= UI RENDER =================
function typeMessage(role, text, timestamp = new Date().toISOString()) {
  const line = document.createElement("div");
  line.className = `message ${role}`;

  const meta = document.createElement("span");
  meta.className = "message-time";
  meta.textContent = `[${formatTime(timestamp)}] `;
  line.appendChild(meta);

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

  if (role === "bot") {
    const copyButton = document.createElement("button");
    copyButton.className = "copy-response";
    copyButton.type = "button";
    copyButton.textContent = "COPIAR";
    copyButton.setAttribute("aria-label", "Copiar respuesta");
    copyButton.onclick = () => copyToClipboard(text, copyButton);
    line.appendChild(copyButton);
  }

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
    typeMessage(m.role, m.content, m.timestamp);
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

  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
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
  loading.textContent = `> ${getCharacterLabel()}: escribiendo...`;

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
  line.textContent = `[${formatTime()}] > ERROR: ${text}`;

  elements.messages.appendChild(line);
  scrollToBottom();
}

function renderChatControls() {
  if (!elements.header) return;

  elements.header.innerHTML = `
    <span>> SYSTEM: ${getCharacterLabel()}</span>
    <span id="history-status" class="history-status">> HISTORIAL: VACIO</span>
  `;
}

function updateHistoryIndicator() {
  const status = document.getElementById("history-status");
  if (!status) return;

  status.textContent = state.messages.length > 0
    ? `> HISTORIAL: GUARDADO (${state.messages.length})`
    : "> HISTORIAL: VACIO";
}

function clearHistory() {
  localStorage.removeItem(`chat_${state.character}`);
  state.messages = [];
  elements.messages.innerHTML = "";
  updateHistoryIndicator();
  renderWelcome();
}

function formatTime(timestamp = new Date().toISOString()) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "COPIADO";
  } catch {
    button.textContent = "ERROR";
  } finally {
    setTimeout(() => {
      button.textContent = "COPIAR";
    }, 1200);
  }
}
