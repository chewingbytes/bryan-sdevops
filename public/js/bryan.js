// public/js/bryan.js
// utility functions
function qs(id) { return document.getElementById(id); }
function showEl(el) { el.classList.remove("hidden"); }
function hideEl(el) { el.classList.add("hidden"); }

// Save book (only for add mode)
qs("save-book-btn").addEventListener("click", async () => {
    const mode = qs("save-book-btn").dataset.mode;
    if (mode !== "add") return; // ignore if not adding

    const title = qs("book-title").value.trim();
    const author = qs("book-author").value.trim();
    const content = qs("book-content").value.trim();
    if (!title || !author || !content) return alert("Please fill all fields");

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return alert("Not authenticated");

    try {
        const res = await fetch("/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser.username, title, author, content })
        });

        if (!res.ok) throw new Error("Failed to add book");

        alert("Book added");
        hideEl(qs("book-modal"));
        loadBooks();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

qs("cancel-btn").addEventListener("click", () => {
    hideEl(qs("book-modal"));   // just hide modal
});

// expose internals for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports._test = { qs, showEl, hideEl };
}
