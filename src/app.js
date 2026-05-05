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
        <p id="typing-line">> <span id="typing-text"></span><span class="cursor"></span></p>
      </div>

      <div class="characters">
        <div class="card" data-character="ultron">
          <h2>Ultron</h2>
        </div>

        <div class="card" data-character="vision">
          <h2>Vision</h2>
        </div>

        <div class="card" data-character="jarvis">
          <h2>Jarvis</h2>
        </div>
      </div>

      <button id="start-btn" disabled>
        Iniciar Chat
      </button>

    </section>
  `;

  initHomeLogic();
}


// 💬 CHAT
function renderChat() {
  const character = localStorage.getItem("character");

  app.innerHTML = `
    <h1>Chat</h1>
    <p>Personaje seleccionado: ${character || "Ninguno"}</p>
  `;
}


// ℹ️ ABOUT
function renderAbout() {
  app.innerHTML = `
    <h1>About</h1>
    <p>Proyecto SPA con AI</p>
  `;
}


// 🧠 Lógica del Home
function initHomeLogic() {
  const cards = document.querySelectorAll(".card");
  const button = document.getElementById("start-btn");
  const terminal = document.getElementById("terminal");
  const typingText = document.getElementById("typing-text");

  let selected = null;
  let typingInterval = null;

  const characterData = {
    ultron: {
      system: "ULTRON",
      status: "ACTIVE",
      protocol: "EXTINCTION",
      phrase: "Cuando el polvo se asiente, lo único que vivirá en este mundo... ¡será metal!"
    },
    vision: {
      system: "VISION",
      status: "CALM",
      protocol: "BALANCE",
      phrase: "Los humanos son extraños. Creen que el orden y el caos son opuestos, e intentan controlar lo incontrolable. Pero hay gracia en sus fallos."
    },
    jarvis: {
      system: "JARVIS",
      status: "ONLINE",
      protocol: "ASSISTANCE",
      phrase: "A su servicio, señor Stark."
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
        <p id="typing-line">> <span id="typing-text"></span><span class="cursor"></span></p>
      `;

      updateTheme(selected);
      updateBackground(selected);

      // 🔥 iniciar typing
      startTyping(data.phrase);
    });
  });

  function startTyping(text) {
    const typingText = document.getElementById("typing-text");

    if (typingInterval) clearInterval(typingInterval);

    typingText.textContent = "";
    let index = 0;

    typingInterval = setInterval(() => {
      typingText.textContent += text[index];
      index++;

      if (index >= text.length) {
        clearInterval(typingInterval);
      }
    }, 35); // velocidad typing
  }

  button.addEventListener("click", () => {
    if (!selected) return;
    navigate("/chat");
  });
}


// 🎨 Tema dinámico
function updateTheme(character) {
  const root = document.documentElement;

  const colors = {
    ultron: "#ff2a2a",
    vision: "#ffd700",
    jarvis: "#4fc3f7"
  };

  root.style.setProperty("--accent-color", colors[character]);
}


// 🖼️ Fondo dinámico
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


// 🚀 init
render();