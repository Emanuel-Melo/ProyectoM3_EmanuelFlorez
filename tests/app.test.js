import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/chat.js", () => ({
  initChat: vi.fn()
}));

async function loadApp(path = "/") {
  vi.resetModules();

  document.body.innerHTML = `
    <div id="background-visual"></div>
    <nav class="nav">
      <a href="/home" data-link>Home</a>
      <a href="/chat" data-link>Chat</a>
      <a href="/about" data-link>About</a>
    </nav>
    <main id="app"></main>
  `;

  window.history.replaceState({}, "", path);
  await import("../src/app.js");
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    callback();
    return 1;
  });
  localStorage.clear();
  document.documentElement.style.cssText = "";
  document.body.className = "";
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("app spa", () => {
  it("renders the home screen by default", async () => {
    await loadApp("/");

    expect(document.querySelector(".home")).toBeTruthy();
    expect(document.querySelectorAll(".card")).toHaveLength(3);
    expect(document.querySelector("#start-btn").disabled).toBe(true);
  });

  it("selecting a character stores it, enables chat and shows profile info", async () => {
    await loadApp("/home");

    document.querySelector('[data-character="ultron"]').click();

    expect(localStorage.getItem("character")).toBe("ultron");
    expect(document.body.classList.contains("ultron-mode")).toBe(true);
    expect(document.querySelector("#start-btn").disabled).toBe(false);
    expect(document.querySelector("#character-info").textContent).toContain(
      "Nacimiento"
    );
  });

  it("selecting Vision applies the correct background state", async () => {
    await loadApp("/home");

    document.querySelector('[data-character="vision"]').click();
    await vi.runOnlyPendingTimersAsync();

    const background = document.querySelector("#background-visual");

    expect(document.body.classList.contains("vision-mode")).toBe(true);
    expect(background.classList.contains("vision-bg")).toBe(true);
    expect(background.classList.contains("active-bg")).toBe(true);
  });

  it("start button navigates to chat after selecting a character", async () => {
    const { initChat } = await import("../src/chat.js");
    await loadApp("/home");

    document.querySelector('[data-character="jarvis"]').click();
    document.querySelector("#start-btn").click();

    expect(window.location.pathname).toBe("/chat");
    expect(document.querySelector("#chat-container")).toBeTruthy();
    expect(document.querySelector("#chat-header").textContent).toContain(
      "JARVIS"
    );
    expect(initChat).toHaveBeenCalled();
  });

  it("about route renders independent content and clears character modes", async () => {
    document.body.classList.add("ultron-mode");
    await loadApp("/about");

    expect(document.querySelector(".about")).toBeTruthy();
    expect(document.querySelector(".about-header h1").textContent).toContain(
      "AI Character Chat"
    );
    expect(document.body.classList.contains("ultron-mode")).toBe(false);
  });

  it("clicking nav links uses SPA navigation", async () => {
    await loadApp("/home");

    document.querySelector('a[href="/about"]').click();

    expect(window.location.pathname).toBe("/about");
    expect(document.querySelector(".about")).toBeTruthy();
  });
});
