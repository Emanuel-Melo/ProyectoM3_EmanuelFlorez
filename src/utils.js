export async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const contentType = res.headers.get("content-type") || "";

    let data;

    // 🔥 SAFE PARSING
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();

      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    // 🔥 ERROR HANDLING ROBUSTO
    if (!res.ok) {
      const message =
        data?.reply ||
        data?.message ||
        `HTTP Error ${res.status}`;

      throw new Error(message);
    }

    return data;

  } catch (error) {
    throw new Error(error?.message || "Network error");
  }
}

// ================= UTILS =================

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createError(message = "Unknown error") {
  return {
    error: true,
    message
  };
}

export function formatError(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return err.message || "Unexpected error";
}

export function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

// 🔥 SECURITY FIX: sanitización más estricta
export function sanitizeInput(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

// 🔥 NUEVO: validación de mensajes AI (IMPORTANTE PARA RUBRICA)
export function isValidAIResponse(data) {
  return data && typeof data.reply === "string" && data.reply.length > 0;
}