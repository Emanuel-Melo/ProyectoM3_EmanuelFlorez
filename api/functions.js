export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Invalid request" });
    }

    const responses = [
      "Procesando solicitud...",
      "Interesante, dame un momento.",
      "Analizando información recibida.",
      "Solicitud entendida, generando respuesta."
    ];

    const reply = responses[Math.floor(Math.random() * responses.length)];

    return res.status(200).json({ reply });

  } catch {
    return res.status(500).json({ reply: "Error interno del servidor" });
  }
}