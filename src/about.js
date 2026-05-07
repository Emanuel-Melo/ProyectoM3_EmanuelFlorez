export function renderAbout() {
  const selectedCharacter = localStorage.getItem("character") || "jarvis";

  return `
    <section class="about">
      <header class="about-header">
        <p class="about-kicker">> ARCHIVE: PROJECT_M3</p>
        <h1>AI Character Chat</h1>
        <p>
          Interfaz experimental para conversar con perfiles inspirados en
          asistentes y entidades de ciencia ficcion.
        </p>
      </header>

      <div class="about-grid">
        <article class="about-panel about-panel-ultron">
          <span class="about-label">> STATUS</span>
          <h2>SPA activa</h2>
          <p>
            La aplicacion funciona como una experiencia de una sola pagina:
            Home, Chat y About cambian sin recargar el sitio completo.
          </p>
        </article>

        <article class="about-panel about-panel-vision">
          <span class="about-label">> DESIGN</span>
          <h2>Terminal visual</h2>
          <p>
            El estilo usa fondos con luz, texto monoespaciado, estados por
            personaje y animaciones suaves para reforzar la identidad de cada
            seleccion.
          </p>
        </article>

        <article class="about-panel about-panel-jarvis">
          <span class="about-label">> CHARACTER</span>
          <h2>${selectedCharacter.toUpperCase()}</h2>
          <p>
            Personaje activo guardado en el navegador. Este valor se usa para
            restaurar tema, fondo y etiqueta dentro del chat.
          </p>
        </article>
      </div>

      <div class="about-log">
        <p>> BUILD: VERCEL_STATIC_SPA</p>
        <p>> API: SERVERLESS_FUNCTION</p>
        <p>> FRONTEND: HTML + CSS + JS MODULES</p>
      </div>
    </section>
  `;
}
