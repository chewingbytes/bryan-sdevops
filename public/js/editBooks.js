// open edit modal
function openEditModal(book) {
    qs("modal-title").textContent = "Edit Book";
    // cancel add/edit book modal
    qs("cancel-btn").addEventListener("click", () => {
        hideEl(qs("book-modal"));   // just hide modal
    });
    qs("book-title").value = book.title;
    qs("book-author").value = book.author;
    qs("book-content").value = book.content;
    qs("save-book-btn").dataset.mode = "edit"; // mark mode for edit
    showEl(qs("book-modal"));

    window.editingOriginalTitle = book.title;
}

// save edited book (PUT only)
qs("save-book-btn").addEventListener("click", async () => {
    if (qs("save-book-btn").dataset.mode !== "edit") return; // ignore if not editing
    const title = qs("book-title").value.trim();
    const author = qs("book-author").value.trim();
    const content = qs("book-content").value.trim();
    if (!title || !author || !content) return alert("Please fill all fields");
    if (!window.editingOriginalTitle) return alert("Select a book to edit");

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return alert("Not authenticated");

    try {
        const res = await fetch(
            `/books/${encodeURIComponent(window.editingOriginalTitle)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, author, content }),
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to update book");
        }

        alert("Book updated");
        hideEl(qs("book-modal"));
        window.editingOriginalTitle = null;
        loadBooks();
    } catch (err) {
        console.error(err);
        alert(err.message || "Save failed");
    }
});