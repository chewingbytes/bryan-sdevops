function qs(id) { return document.getElementById(id); }
function showEl(el) { el.classList.remove("hidden"); }
function hideEl(el) { el.classList.add("hidden"); }

// load books (read-only, no editing)
async function loadBooks() {
    try {
        const res = await fetch("/books");
        if (!res.ok) throw new Error("Failed to load books");
        const body = await res.json();
        const books = Array.isArray(body.books) ? body.books : [];
        renderBookTable(books);
        window.books = books; // for william.js to use for edit/delete
    } catch (err) {
        console.error(err);
        alert("Failed to load books");
    }
}

// render books table
function renderBookTable(books) {
    const tbody = qs("book-list");
    tbody.innerHTML = "";
    books.forEach((b) => {
        const tr = document.createElement("tr");
        const tdTitle = document.createElement("td");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = b.title;
        a.addEventListener("click", e => {
            e.preventDefault();
            openReadModal(b.title, b.content, b.author, b.user);
        });
        tdTitle.appendChild(a);

        const tdAuthor = document.createElement("td");
        tdAuthor.textContent = b.author || "";

        tr.appendChild(tdTitle);
        tr.appendChild(tdAuthor);
        tbody.appendChild(tr);
    });
}

// Add Book button
const addBookBtn = qs("add-book-btn");
if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
        qs("modal-title").textContent = "Add Book";
        qs("book-title").value = "";
        qs("book-author").value = "";
        qs("book-content").value = "";
        qs("save-book-btn").dataset.mode = "add"; // mark mode
        showEl(qs("book-modal"));
    });
}

window.loadBooks = loadBooks;