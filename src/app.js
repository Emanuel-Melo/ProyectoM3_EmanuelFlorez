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
    const path = window.location.pathname;
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


function renderHome() {
    app.innerHTML = `
        <section class="home">

        <div class="terminal">
            <p>> SYSTEM: ---</p>
            <p>> STATUS: WAITING SELECTION</p>
            <p>> PROTOCOL: ---</p>
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
}


function renderChat() {
    app.innerHTML = `
        <h1>Chat</h1>
        <p>Aquí irá el chat...</p>
    `;
}


function renderAbout() {
    app.innerHTML = `
        <h1>About</h1>
        <p>Proyecto SPA con AI</p>
    `;
}


// Render inicial
render();