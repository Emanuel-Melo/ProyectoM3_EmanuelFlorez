export async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const contentType = res.headers.get("content-type") || "";

    let data = null;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = safeParseJSON(text) || { message: text };
    }

    if (!res.ok) {
      const errorMessage = data?.message || `HTTP Error: ${res.status}`;
      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    throw new Error(error?.message || "Network error");
  }
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
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

export function sanitizeInput(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[<>]/g, "").trim();
}