import { describe, expect, it, vi, afterEach } from "vitest";
import {
  createError,
  fetchJson,
  formatError,
  isEmpty,
  isValidAIResponse,
  sanitizeInput
} from "../src/utils.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("utils", () => {
  it("sanitizeInput escapes angle brackets and trims text", () => {
    expect(sanitizeInput(" <script>alert(1)</script> ")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("sanitizeInput returns an empty string for non-string values", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(42)).toBe("");
  });

  it("isEmpty detects null, undefined, empty strings and empty arrays", () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty("")).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty("ultron")).toBe(false);
  });

  it("formatError normalizes missing, string and Error values", () => {
    expect(formatError()).toBe("Unknown error");
    expect(formatError("Network error")).toBe("Network error");
    expect(formatError(new Error("Gemini failed"))).toBe("Gemini failed");
  });

  it("createError returns a consistent error object", () => {
    expect(createError("Invalid input")).toEqual({
      error: true,
      message: "Invalid input"
    });
  });

  it("isValidAIResponse validates non-empty reply strings", () => {
    expect(isValidAIResponse({ reply: "SYSTEM ONLINE" })).toBe(true);
    expect(isValidAIResponse({ reply: "" })).toBe(false);
    expect(isValidAIResponse({ message: "missing reply" })).toBe(false);
  });

  it("fetchJson parses JSON responses and adds JSON headers", async () => {
    const json = vi.fn().mockResolvedValue({ reply: "Ready" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson("/api/chat")).resolves.toEqual({ reply: "Ready" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        })
      })
    );
  });

  it("fetchJson throws backend messages for failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ reply: "Gemini error" })
      })
    );

    await expect(fetchJson("/api/chat")).rejects.toThrow("Gemini error");
  });
});
