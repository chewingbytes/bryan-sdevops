/** @jest-environment jsdom */

const fs = require("fs");
const path = require("path");

function setupDOM() {
  document.body.innerHTML = `
    <button id="save-book-btn" data-mode="add"></button>
    <button id="cancel-btn"></button>
    <input id="book-title" />
    <input id="book-author" />
    <textarea id="book-content"></textarea>
    <div id="book-modal" class="hidden"></div>
  `;
}

describe("public/js/bryan.js behaviors", () => {
  beforeEach(() => {
    jest.resetModules();
    setupDOM();
    // mock loadBooks used after success
    global.loadBooks = jest.fn();
  });

  test("save button requires fields and auth", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const btn = document.getElementById("save-book-btn");
    btn.dataset.mode = "add";

    // no user in localStorage
    localStorage.removeItem("currentUser");
    // load module which binds events
    require("../../public/js/bryan.js");

    // simulate click
    btn.click();
    expect(alertSpy).toHaveBeenCalledWith("Please fill all fields");
    alertSpy.mockRestore();
  });

  test("save sends fetch when authenticated and fields present", async () => {
    window.alert = jest.fn();
    localStorage.setItem("currentUser", JSON.stringify({ username: "u" }));
    document.getElementById("book-title").value = "T";
    document.getElementById("book-author").value = "A";
    document.getElementById("book-content").value = "C";

    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    require("../../public/js/bryan.js");
    document.getElementById("save-book-btn").click();

    // allow event handler to run
    await new Promise((r) => setTimeout(r, 10));

    expect(global.fetch).toHaveBeenCalledWith(
      "/books",
      expect.objectContaining({ method: "POST" })
    );
    expect(window.alert).toHaveBeenCalledWith("Book added");
  });

  test("save shows Not authenticated when user not set", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    localStorage.removeItem("currentUser");
    document.getElementById("book-title").value = "T";
    document.getElementById("book-author").value = "A";
    document.getElementById("book-content").value = "C";

    require("../../public/js/bryan.js");
    document.getElementById("save-book-btn").click();
    await new Promise((r) => setTimeout(r, 10));

    expect(alertSpy).toHaveBeenCalledWith("Not authenticated");
    alertSpy.mockRestore();
  });

  test("handles fetch failure and calls console.error + alert", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    localStorage.setItem("currentUser", JSON.stringify({ username: "u" }));
    document.getElementById("book-title").value = "T";
    document.getElementById("book-author").value = "A";
    document.getElementById("book-content").value = "C";

    // simulate server returning not ok
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    require("../../public/js/bryan.js");
    document.getElementById("save-book-btn").click();
    await new Promise((r) => setTimeout(r, 10));

    expect(consoleSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Failed to add book");

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test("cancel hides modal", () => {
    require("../../public/js/bryan.js");
    const modal = document.getElementById("book-modal");
    modal.classList.remove("hidden");

    document.getElementById("cancel-btn").click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  test("mode !== add is ignored (no fetch)", async () => {
    window.alert = jest.fn();
    global.fetch = jest.fn();

    const btn = document.getElementById("save-book-btn");
    btn.dataset.mode = "edit";

    require("../../public/js/bryan.js");
    btn.click();
    await new Promise((r) => setTimeout(r, 10));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("showEl/hideEl helpers via exported _test", () => {
    const mod = require("../../public/js/bryan.js");
    const { showEl, hideEl } = mod._test;
    const modal = document.getElementById("book-modal");

    // showEl should remove hidden
    modal.classList.add("hidden");
    showEl(modal);
    expect(modal.classList.contains("hidden")).toBe(false);

    // hideEl should add hidden
    hideEl(modal);
    expect(modal.classList.contains("hidden")).toBe(true);
  });
});
