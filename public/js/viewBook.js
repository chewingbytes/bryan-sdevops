function qs(id) { return document.getElementById(id); }
function showEl(el) { el.classList.remove("hidden"); }
function hideEl(el) { el.classList.add("hidden"); }

// open read modal
function openReadModal(t, c, a, u) {
    qs("read-title").innerHTML = `<strong>Title:</strong> ${t}`;
    qs("read-content").innerHTML = `
    <p><strong>Author:</strong> ${a}</p>
    <p><strong>Owner:</strong> ${u}</p>
    <hr />
    <p>${c}</p>
  `;
    showEl(qs("read-modal"));
}

qs("close-read-btn").addEventListener("click", () => {
    hideEl(qs("read-modal"));
});

window.openReadModal = openReadModal;