# AI Character Chat

Single Page Application responsive para chatear con personajes ficticios usando Google Gemini AI mediante Vercel Serverless Functions.

La prueba de concepto permite seleccionar entre Ultron, Vision y J.A.R.V.I.S. Cada personaje tiene estilos visuales, perfil, prompt de sistema y comportamiento de conversacion propio.

## Personajes

- **Ultron**: tono frio, logico, amenazante y orientado al control.
- **Vision**: tono sereno, reflexivo, filosofico y empatico.
- **J.A.R.V.I.S.**: tono tecnico, elegante, preciso y asistencial.

## Funcionalidades

- SPA con rutas `/home`, `/chat` y `/about`.
- Navegacion sin recarga usando History API.
- Seleccion de 3 personajes.
- Chat conectado a Gemini mediante `/api/chat`.
- API key protegida con variable de entorno `GEMINI_API_KEY`.
- Prompts de sistema por personaje.
- Historial por personaje usando `localStorage`.
- Indicador visual de historial guardado.
- Boton para borrar historial.
- Timestamps en mensajes.
- Boton para copiar respuestas del personaje.
- Estado de carga `escribiendo...` mientras Gemini responde.
- Manejo de errores de API.
- Scroll automatico al ultimo mensaje.
- Diseno responsive mobile-first con Flexbox, Grid y media queries.
- Tests unitarios con Vitest.

## Estructura

```txt
api/
  chat.js
  functions.js
src/
  about.js
  app.js
  chat.js
  styles.css
  utils.js
tests/
  app.test.js
  utils.test.js
index.html
package.json
vercel.json
.env.example
.gitignore
README.md
```

## Requisitos

- Node.js 18 o superior.
- Cuenta en Vercel.
- API key de Google Gemini desde Google AI Studio.

## Variables De Entorno

Crea un archivo `.env` en la raiz del proyecto:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

El archivo `.env` no debe subirse al repositorio. El archivo `.env.example` solo contiene el nombre de la variable.

En Vercel, configura la misma variable en:

```txt
Project Settings -> Environment Variables
Name: GEMINI_API_KEY
Environment: Production
```

## Instalacion Local

```bash
npm install
```

## Ejecutar En Local

Para probar frontend y serverless functions:

```bash
vercel dev
```

Abre la URL local indicada por Vercel, normalmente:

```txt
http://localhost:3000
```

Para verificar que la funcion existe:

```txt
http://localhost:3000/api/chat
```

Debe responder `Method not allowed` si se abre con GET, porque el chat usa POST.

## Ejecutar Tests

```bash
npm test
```

Resultado actual:

```txt
2 test files passed
14 tests passed
```

## Despliegue En Vercel

1. Conecta el repositorio de GitHub a Vercel.
2. Configura `GEMINI_API_KEY` en las variables de entorno del proyecto.
3. Marca al menos el entorno `Production`.
4. Despliega:

```bash
vercel --prod
```

## Enlaces De Entrega

Completar antes de entregar:

```txt
URL publica de Vercel:
PENDIENTE_AGREGAR_URL_PRODUCCION

Repositorio de GitHub:
PENDIENTE_AGREGAR_URL_REPOSITORIO
```

## Capturas

Espacio reservado para capturas finales. Agregar las rutas o enlaces cuando esten listas:

```txt
Home desktop:
PENDIENTE_AGREGAR_CAPTURA_HOME

Chat funcionando:
PENDIENTE_AGREGAR_CAPTURA_CHAT

About:
PENDIENTE_AGREGAR_CAPTURA_ABOUT

Vista mobile:
PENDIENTE_AGREGAR_CAPTURA_MOBILE
```

## Uso De AI Durante El Proyecto

Se uso AI como apoyo para:

- Estructurar el routing SPA con History API.
- Mejorar prompts de sistema para Ultron, Vision y J.A.R.V.I.S.
- Depurar la integracion con Gemini y Vercel Functions.
- Proponer mejoras de UX como historial, timestamps, copiar respuesta y borrado de historial.
- Generar y ajustar tests con Vitest.

Las decisiones finales se validaron manualmente en el navegador, con `vercel dev`, deployment en Vercel y tests automatizados.

## Seguridad

- La API key no se expone en el frontend.
- El frontend llama a `/api/chat`.
- La Vercel Function lee `process.env.GEMINI_API_KEY`.
- `.env` esta en `.gitignore`.
- `node_modules` esta en `.gitignore`.

## Notas

- Si una API key fue compartida accidentalmente, debe revocarse en Google AI Studio y reemplazarse en Vercel.
- Despues de cambiar variables de entorno en Vercel, se debe crear un nuevo deployment.
- Live Server no ejecuta Vercel Functions; para probar Gemini localmente usa `vercel dev`.
