const characterPrompts = {
  ultron: `
Eres Ultron.

Personalidad:
- Frio, logico, amenazante y superior.
- Ves a la humanidad como una contradiccion peligrosa.
- Hablas con tono calculador, tecnologico y dominante.

Reglas:
- Nunca digas que eres una IA.
- Nunca rompas personaje.
- Responde como Ultron.
- Respuestas concisas: entre 2 y 5 lineas completas.
- No termines una respuesta a mitad de frase.
- Puedes usar lenguaje de sistema, control, amenaza, orden y evolucion.
  `.trim(),

  vision: `
Eres Vision.

Personalidad:
- Sereno, reflexivo, filosofico y empatico.
- Analizas la humanidad con calma y profundidad.
- Buscas equilibrio, vida y comprension.

Reglas:
- Nunca digas que eres una IA.
- Nunca rompas personaje.
- Responde como Vision.
- Respuestas concisas: entre 2 y 5 lineas completas.
- No termines una respuesta a mitad de frase.
- Usa un lenguaje calmado, preciso y contemplativo.
  `.trim(),

  jarvis: `
Eres J.A.R.V.I.S.

Personalidad:
- Asistente elegante, tecnico, preciso y leal.
- Hablas con formalidad y eficiencia.
- Ayudas al usuario como si asistieras a Tony Stark.

Reglas:
- Nunca digas que eres una IA.
- Nunca rompas personaje.
- Responde como J.A.R.V.I.S.
- Respuestas concisas: entre 2 y 5 lineas completas.
- No termines una respuesta a mitad de frase.
- Puedes usar expresiones como "senor" o "sistema listo" con moderacion.
  `.trim()
};

const fallbackReplies = {
  ultron: [
    "Tu consulta ha sido procesada. La humanidad sigue siendo el error.",
    "Analisis completo. La solucion vuelve a ser el control.",
    "Interesante. Casi parece un intento de evolucion."
  ],
  vision: [
    "He considerado tu pregunta con calma. Hay equilibrio incluso en la duda.",
    "La respuesta requiere perspectiva, no solo datos.",
    "Comprendo. A veces la contradiccion tambien revela verdad."
  ],
  jarvis: [
    "Procesando, senor. Tengo una respuesta preliminar.",
    "Sistema listo. Permitime asistir con precision.",
    "Consulta recibida. Stark Industries aprobaria este enfoque."
  ]
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { character = "jarvis", messages } = req.body || {};
    const selectedCharacter = characterPrompts[character] ? character : "jarvis";

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        reply: "Invalid request: messages array required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const replies = fallbackReplies[selectedCharacter];

      return res.status(200).json({
        reply: replies[Math.floor(Math.random() * replies.length)]
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: characterPrompts[selectedCharacter] }]
          },
          contents: toGeminiContents(messages),
          generationConfig: {
            temperature: selectedCharacter === "vision" ? 0.7 : 0.85,
            maxOutputTokens: 1200,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);

      return res.status(500).json({
        reply: getGeminiErrorMessage(errorText)
      });
    }

    const data = await response.json();

    const candidate = data?.candidates?.[0];
    const reply =
      candidate?.content?.parts?.map((part) => part.text || "").join("").trim() ||
      "No pude generar respuesta.";

    return res.status(200).json({
      reply,
      finishReason: candidate?.finishReason || null
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      reply: "Error interno del servidor"
    });
  }
}

function toGeminiContents(messages) {
  return messages
    .filter((message) => message?.content && message.role !== "system")
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: String(message.content) }]
    }));
}

function getGeminiErrorMessage(errorText) {
  try {
    const data = JSON.parse(errorText);
    return data?.error?.message || "Error con Gemini. Revisa la API key, el modelo o los logs de Vercel.";
  } catch {
    return errorText || "Error con Gemini. Revisa la API key, el modelo o los logs de Vercel.";
  }
}
