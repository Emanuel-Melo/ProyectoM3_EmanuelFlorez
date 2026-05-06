import { initChat } from "./chat.js";

const app = document.getElementById("app");

/* =========================
   ROUTER (FIXED)
========================= */

const routes = {
  "/": renderHome,
  "/home": renderHome,
  "/chat": renderChat,
  "/about": renderAbout,
};

function navigate(path) {
  window.history.pushState({}, "", path);
  render(path);
}

function render(path = window.location.pathname) {
  const route = routes[path] ? path : "/";
  const view = routes[route];
  view();
}

window.addEventListener("popstate", () => {
  render(window.location.pathname);
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  navigate(link.getAttribute("href"));
});

/* =========================
   HOME
========================= */

function renderHome() {
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

/* =========================
   CHAT
========================= */

function renderChat() {
  const character = localStorage.getItem("character");

  app.innerHTML = `
    <section id="chat-container">

      <div id="chat-header">
        > SYSTEM: ${character ? character.toUpperCase() : "UNKNOWN"}
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

  initChat();
}

/* =========================
   ABOUT
========================= */

function renderAbout() {
  app.innerHTML = `
    <section class="about">
      <h1>About</h1>
      <p>Proyecto SPA con AI</p>
      <a href="/home" data-link>Volver</a>
    </section>
  `;
}

/* =========================
   HOME LOGIC
========================= */

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
        "CUANDO EL POLVO SE ASIENTE, LO ÚNICO QUE VIVIRÁ EN ESTE MUNDO... ¡SERÁ METAL!"
    },
    vision: {
      system: "VISION",
      status: "CALM",
      protocol: "BALANCE",
      phrase:
        "LOS HUMANOS SON EXTRAÑOS. CREEN QUE EL ORDEN Y EL CAOS SON OPUESTOS... E INTENTAN CONTROLAR LO INCONTROLABLE... PERO HAY GRACIA EN SUS FALLOS."
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
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      selected = card.dataset.character;
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
    if (!selected) return;
    navigate("/chat");
  });
}

/* =========================
   TYPING EFFECT
========================= */

function startTyping(text, character) {
  const el = document.getElementById("typing-text");
  if (!el) return;

  el.textContent = "";
  let i = 0;

  function type() {
    if (i >= text.length) {
      el.classList.remove("glitch");
      return;
    }

    const char = text[i];
    el.textContent += char;

    let delay = character === "vision" ? 60 : 30;

    if (char === "." || char === "," || char === ";") delay += 150;
    if (text.slice(i, i + 3) === "...") delay += 400;

    if (character === "ultron" && Math.random() < 0.25) {
      el.classList.add("glitch");
    } else {
      el.classList.remove("glitch");
    }

    i++;
    setTimeout(type, delay);
  }

  type();
}

/* =========================
   THEMES
========================= */

function updateTheme(character) {
  const root = document.documentElement;
  const body = document.body;

  const colors = {
    ultron: "#ff2a2a",
    vision: "#ffd54f",
    jarvis: "#4fc3f7",
  };

  root.style.setProperty("--accent-color", colors[character]);

  body.classList.remove("ultron-mode", "vision-mode", "jarvis-mode");

  if (character === "ultron") {
    body.classList.add("ultron-mode");
    body.classList.add("screen-distortion");
    setTimeout(() => body.classList.remove("screen-distortion"), 400);
  }

  if (character === "vision") {
    body.classList.add("vision-mode");
  }

  if (character === "jarvis") {
    body.classList.add("jarvis-mode");
  }
}

/* =========================
   BACKGROUND
========================= */

function updateBackground(character) {
  const bg = document.getElementById("background-visual");
  if (!bg) return;

  const images = {
    ultron: "assets/ultron.png",
    vision: "assets/vision.png",
    jarvis: "assets/jarvis.png",
  };

  bg.style.backgroundImage = `url(${images[character]})`;

  bg.classList.remove("active-bg");
  void bg.offsetWidth;
  bg.classList.add("active-bg");
}

/* =========================
   INIT APP
========================= */

render();