// public/js/book.js

// helpers
function qs(id) {
  return document.getElementById(id);
}
function showEl(el) {
  el.classList.remove("hidden");
}
function hideEl(el) {
  el.classList.add("hidden");
}

let editingOriginalTitle = null; // used when editing a book

async function loadBooks() {
  try {
    const res = await fetch("/books");
    if (!res.ok) throw new Error("Failed to load books");
    const body = await res.json();
    const books = Array.isArray(body.books) ? body.books : [];
    renderBookTable(books);
  } catch (err) {
    console.error(err);
    alert("Failed to load books");
  }
}

// Open Add Book modal
const addBookBtn = qs("add-book-btn");
if (addBookBtn) {
  addBookBtn.addEventListener("click", () => {
    editingOriginalTitle = null; // make sure we are adding a new book
    qs("modal-title").textContent = "Add Book";
    qs("book-title").value = "";
    qs("book-author").value = "";
    qs("book-content").value = "";
    showEl(qs("book-modal"));
  });
}

function renderBookTable(books) {
  const tbody = qs("book-list");
  tbody.innerHTML = "";

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const role = currentUser?.role || "user";

  books.forEach((b) => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.textContent = b.title;
    titleLink.addEventListener("click", (e) => {
      e.preventDefault();
      openReadModal(b.title, b.content, b.author, b.user);
    });
    tdTitle.appendChild(titleLink);

    const tdAuthor = document.createElement("td");
    tdAuthor.textContent = b.author || "";

    tr.appendChild(tdTitle);
    tr.appendChild(tdAuthor);

    // actions: only show edit/delete when currentUser is admin AND admin owns the book or you want admins to manage all
    const tdActions = document.createElement("td");
    tdActions.style.whiteSpace = "nowrap";

    if (role === "admin") {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn small";
      editBtn.addEventListener("click", () => openEditModal(b));
      tdActions.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "btn small danger";
      delBtn.addEventListener("click", () => openDeleteConfirm(b));
      tdActions.appendChild(delBtn);
    } else {
      tdActions.textContent = ""; // users just view
    }

    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

/* Read modal */
/* Read modal */
function openReadModal(bookTitle, bookContent, bookAuthor, bookUser) {
  const modal = qs("read-modal");

  // Build HTML neatly
  qs("read-title").innerHTML = `<strong>Title:</strong> ${bookTitle}`;
  qs("read-content").innerHTML = `
    <p><strong>Author:</strong> ${bookAuthor}</p>
    <p><strong>Owner:</strong> ${bookUser}</p>
    <hr />
    <p>${bookContent}</p>
  `;

  showEl(modal);
}
qs("close-read-btn").addEventListener("click", () => hideEl(qs("read-modal")));

qs("cancel-btn").addEventListener("click", () => hideEl(qs("book-modal")));

qs("save-book-btn").addEventListener("click", async () => {
  const title = qs("book-title").value.trim();
  const author = qs("book-author").value.trim();
  const content = qs("book-content").value.trim();
  if (!title || !author || !content) return alert("Please fill all fields");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser) return alert("Not authenticated");

  try {
    if (!editingOriginalTitle) {
      // add
      const res = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUser.username,
          title,
          author,
          content,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add book");
      }
      alert("Book added");
    } else {
      // update
      const res = await fetch(
        `/books/${encodeURIComponent(editingOriginalTitle)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: currentUser.username,
            title,
            author,
            content,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update book");
      }
      alert("Book updated");
    }

    hideEl(qs("book-modal"));
    loadBooks();
  } catch (err) {
    console.error(err);
    alert(err.message || "Save failed");
  }
});

function openEditModal(book) {
  editingOriginalTitle = book.title;
  qs("modal-title").textContent = "Edit Book";
  qs("book-title").value = book.title;
  qs("book-author").value = book.author;
  qs("book-content").value = book.content;
  showEl(qs("book-modal"));
}

/* Delete */
function openDeleteConfirm(book) {
  if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
  doDelete(book);
}
async function doDelete(book) {
  try {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    if (!currentUser) return alert("Not authenticated");

    const res = await fetch(`/books/${encodeURIComponent(book.title)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentUser.username }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete");
    }
    alert("Deleted");
    loadBooks();
  } catch (err) {
    console.error(err);
    alert(err.message || "Delete failed");
  }
}

window.loadBooks = loadBooks;
window.openReadModal = openReadModal;
