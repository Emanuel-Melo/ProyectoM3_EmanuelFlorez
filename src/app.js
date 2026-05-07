import { initChat } from "./chat.js";
import { renderAbout as getAboutTemplate } from "./about.js";

const app = document.getElementById("app");

const routes = {
  "/": renderHome,
  "/home": renderHome,
  "/chat": renderChat,
  "/about": renderAbout
};

// 🔥 Normaliza rutas
function normalizePath(path) {
  if (!path || path === "/") return "/home";
  return path;
}

function navigate(path) {
  const normalized = normalizePath(path);

  if (window.location.pathname === normalized) return;

  window.history.pushState({}, "", normalized);
  render(normalized);
}

function render(path = window.location.pathname) {
  const normalized = normalizePath(path);
  const view = routes[normalized] || routes["/home"];

  app.innerHTML = "";

  view();

  // reset solo en home
  if (normalized === "/home") {
    resetGlobalState();
  }
}

window.addEventListener("popstate", () => {
  render(window.location.pathname);
});

// 🔥 delegación segura de clicks SPA
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  navigate(link.getAttribute("href"));
});

function resetGlobalState() {
  const bg = document.getElementById("background-visual");

  document.body.classList.remove(
    "ultron-mode",
    "vision-mode",
    "jarvis-mode",
    "screen-distortion"
  );

  document.documentElement.style.setProperty("--accent-color", "#ffffff");

  if (bg) {
    bg.innerHTML = "";
    bg.style.backgroundImage = "";
    bg.classList.remove("active-bg", "ultron-bg", "vision-bg", "jarvis-bg");
  }
}

// ================= HOME =================
function renderHome() {
  resetGlobalState();

  app.innerHTML = `
    <section class="home">
      <div class="terminal" id="terminal">
        <p>> SYSTEM: ---</p>
        <p>> STATUS: WAITING SELECTION</p>
        <p>> PROTOCOL: ---</p>
        <p>> <span id="typing-text"></span><span class="cursor"></span></p>
      </div>

      <div class="characters">
        <div class="card" data-character="ultron"><h2>Ultron</h2></div>
        <div class="card" data-character="vision"><h2>Vision</h2></div>
        <div class="card" data-character="jarvis"><h2>Jarvis</h2></div>
      </div>

      <button id="start-btn" disabled>Iniciar Chat</button>
    </section>
  `;

  initHomeLogic();
}

// ================= CHAT =================
function renderChat() {
  const character = localStorage.getItem("character") || "jarvis";

  app.innerHTML = `
    <section id="chat-container">
      <div id="chat-header">
        > SYSTEM: ${character.toUpperCase()}
      </div>

      <div id="chat-messages"></div>

      <form id="chat-form" autocomplete="off">
        <span class="prompt">> USER:</span>

        <div class="input-wrapper">
          <input
            id="chat-input"
            type="text"
            placeholder="type command..."
            autocomplete="off"
          />
          <span class="input-cursor">█</span>
        </div>

        <button type="submit">SEND</button>
      </form>
    </section>
  `;

  // 🔥 inicializa chat correctamente
  updateTheme(character);
  updateBackground(character);
  initChat(character);
}

// ================= ABOUT =================
function renderAbout() {
  const character = localStorage.getItem("character") || "jarvis";

  updateTheme(character);
  updateBackground(character);
  app.innerHTML = getAboutTemplate();
}

// ================= HOME LOGIC =================
function initHomeLogic() {
  const cards = document.querySelectorAll(".card");
  const button = document.getElementById("start-btn");
  const terminal = document.getElementById("terminal");

  let selected = null;

  const characterData = {
    ultron: {
      system: "ULTRON",
      status: "ACTIVE",
      protocol: "EXTINCTION",
      phrase:
        "CUANDO EL POLVO SE ASIENTE, LO ÚNICO QUE VIVIRÁ EN ESTE MUNDO... !SERÁ METAL¡."
    },
    vision: {
      system: "VISION",
      status: "CALM",
      protocol: "BALANCE",
      phrase:
        "LOS HUMANOS SON EXTRAÑOS... CREEN QUE EL ORDEN Y EL CAOS SON OPUESTOS, E INTENTAN CONTROLAR LO INCONTROLABLE... PERO HAY GRACIA EN SUS FALLOS."
    },
    jarvis: {
      system: "JARVIS",
      status: "ONLINE",
      protocol: "ASSISTANCE",
      phrase: "A SU SERVICIO, SEÑOR STARK."
    }
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const character = card.dataset.character;
      if (!character) return;

      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      selected = character;
      localStorage.setItem("character", selected);
      button.disabled = false;

      const data = characterData[selected];

      terminal.innerHTML = `
        <p>> SYSTEM: ${data.system}</p>
        <p>> STATUS: ${data.status}</p>
        <p>> PROTOCOL: ${data.protocol}</p>
        <p>> <span id="typing-text"></span><span class="cursor"></span></p>
      `;

      updateTheme(selected);
      updateBackground(selected);
      startTyping(data.phrase, selected);
    });
  });

  button.addEventListener("click", () => {
    if (selected) navigate("/chat");
  });
}

// ================= HELPERS =================
function startTyping(text, character) {
  const el = document.getElementById("typing-text");
  if (!el) return;

  el.textContent = "";
  let i = 0;

  function type() {
    if (i >= text.length) return;

    el.textContent += text[i];
    i++;

    const delay = character === "vision" ? 60 : 30;
    setTimeout(type, delay);
  }

  type();
}

function updateTheme(character) {
  const root = document.documentElement;
  const body = document.body;

  const colors = {
    ultron: "#ff2a2a",
    vision: "#ffd54f",
    jarvis: "#4fc3f7"
  };

  root.style.setProperty("--accent-color", colors[character] || "#ffffff");

  body.classList.remove(
    "ultron-mode",
    "vision-mode",
    "jarvis-mode",
    "screen-distortion"
  );

  if (character === "ultron") body.classList.add("ultron-mode");
  if (character === "vision") body.classList.add("vision-mode");
  if (character === "jarvis") body.classList.add("jarvis-mode");
}

function updateBackground(character) {
  const bg = document.getElementById("background-visual");
  if (!bg) return;

  const images = {
    ultron: "/src/assets/ultron.png",
    vision: "/src/assets/vision.png",
    jarvis: "/src/assets/jarvis.png"
  };

  bg.classList.remove("active-bg", "ultron-bg", "vision-bg", "jarvis-bg");
  bg.style.backgroundImage = `url(${images[character] || ""})`;

  if (!images[character]) return;

  bg.classList.add(`${character}-bg`);

  requestAnimationFrame(() => {
    bg.classList.add("active-bg");
  });
}

// ================= INIT =================
render();
