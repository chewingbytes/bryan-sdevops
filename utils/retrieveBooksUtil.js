const fs = require('fs').promises;
const path = require('path');

const BOOK_FILE = path.join(__dirname, 'books.json');
const TEMPLATE_FILE = path.join(__dirname, 'books.template.json');

// -----------------
// GET /books
// -----------------
async function getBooks(req, res) {
  try {
    const data = await readBooksFile();
    res.json({ books: data.books || [] });
  } catch (e) {
    console.error('getBooks error', e);
    res.status(500).json({ error: 'Failed to read books' });
  }
}

// -----------------
// read books from JSON file
// returns { books: [...] }
// -----------------
async function readBooksFile() {
  try {
    const raw = await fs.readFile(BOOK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // fallback: template if exists, else empty
    try {
      const tpl = await fs.readFile(TEMPLATE_FILE, 'utf8');
      await fs.writeFile(BOOK_FILE, tpl, 'utf8');
      return JSON.parse(tpl);
    } catch {
      await fs.writeFile(BOOK_FILE, JSON.stringify({ books: [] }, null, 2), 'utf8');
      return { books: [] };
    }
  }
}

module.exports = {
  readBooksFile,
  getBooks
};

