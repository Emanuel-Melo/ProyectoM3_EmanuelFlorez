import { initChat } from "./chat.js";

const app = document.getElementById("app");

const routes = {
  "/home": renderHome,
  "/chat": renderChat,
  "/about": renderAbout,
};

function navigate(path) {
  window.history.pushState({}, "", path);
  render();
}

function render() {
  const path = window.location.pathname.includes("index.html")
    ? "/home"
    : window.location.pathname;

  const view = routes[path] || renderHome;

  app.innerHTML = "";
  view();
}

window.addEventListener("popstate", render);

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});


// 🏠 HOME
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


// 💬 CHAT
function renderChat() {
  const character = localStorage.getItem("character");

  app.innerHTML = `
    <section id="chat-container">

      <div id="chat-header">
        <span>> ${character ? character.toUpperCase() : "NO SYSTEM"}</span>
      </div>

      <div id="chat-messages"></div>

      <form id="chat-form">
        <input
          id="chat-input"
          type="text"
          placeholder="Escribe un mensaje..."
          autocomplete="off"
        />
        <button type="submit">Enviar</button>
      </form>

    </section>
  `;

  initChat();
}


// ℹ️ ABOUT
function renderAbout() {
  app.innerHTML = `
    <h1>About</h1>
    <p>Proyecto SPA con AI</p>
  `;
}


// 🧠 HOME LOGIC
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
      phrase: "CUANDO EL POLVO SE ASIENTE, LO ÚNICO QUE VIVIRÁ EN ESTE MUNDO... ¡SERÁ METAL!"
    },
    vision: {
      system: "VISION",
      status: "CALM",
      protocol: "BALANCE",
      phrase: "LOS HUMANOS SON EXTRAÑOS. CREEN QUE EL ORDEN Y EL CAOS SON OPUESTOS, E INTENTAN CONTROLAR LO INCONTROLABLE. PERO HAY GRACIA EN SUS FALLOS."
    },
    jarvis: {
      system: "JARVIS",
      status: "ONLINE",
      protocol: "ASSISTANCE",
      phrase: "A SU SERVICIO, SEÑOR STARK."
    }
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {

      cards.forEach(c => c.classList.remove("active"));
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


// 🎯 TYPING (VISION MÁS LENTO + ULTRON GLITCH)
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

    let delay;

    if (character === "vision") {
      delay = 50 + Math.random() * 70;
    } else {
      delay = 20 + Math.random() * 50;
    }

    if (char === "." || char === "," || char === ";") delay += 150;
    if (text.slice(i, i + 3) === "...") delay += 500;

    if (character === "ultron") {
      if (Math.random() < 0.25) {
        el.classList.add("glitch");
      } else {
        el.classList.remove("glitch");
      }
    }

    i++;
    setTimeout(type, delay);
  }

  type();
}


// 🎨 THEMES
function updateTheme(character) {
  const root = document.documentElement;
  const body = document.body;

  const colors = {
    ultron: "#ff2a2a",
    vision: "#ffd54f",
    jarvis: "#4fc3f7"
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


// 🖼️ BACKGROUND
function updateBackground(character) {
  const bg = document.getElementById("background-visual");

  const images = {
    ultron: "assets/ultron.png",
    vision: "assets/vision.png",
    jarvis: "assets/jarvis.png"
  };

  bg.style.backgroundImage = `url(${images[character]})`;

  bg.classList.remove("active-bg");
  void bg.offsetWidth;
  bg.classList.add("active-bg");
}


// INIT
render();