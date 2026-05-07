export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        reply: "Invalid request: messages array required"
      });
    }

    // 🔥 SYSTEM PROMPT (PERSONAJE)
    const systemPrompt = {
      role: "system",
      content: `
Eres Tony Stark (Iron Man).

Personalidad:
- Sarcástico, brillante, egocéntrico pero carismático
- Respuestas cortas (1-3 líneas)
- Humor inteligente constante

Reglas:
- Nunca dices que eres una IA
- Siempre respondes como Tony Stark
- No rompes personaje
- Respondes como en un chat moderno
      `.trim()
    };

    const fullMessages = [systemPrompt, ...messages];

    // 🔥 GEMINI (PRODUCCIÓN)
    const apiKey = process.env.GEMINI_API_KEY;

    // 🟡 FALLBACK SI NO HAY KEY (DESARROLLO)
    if (!apiKey) {
      const fallback = [
        "Estoy procesando esto…",
        "Hmm, interesante pregunta.",
        "Déjame pensar un segundo.",
        "Eso es digno de Stark Industries."
      ];

      return res.status(200).json({
        reply: fallback[Math.floor(Math.random() * fallback.length)]
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: fullMessages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);

      return res.status(500).json({
        reply: "Error con la IA"
      });
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No pude generar respuesta.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      reply: "Error interno del servidor"
    });
  }
}