const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    copyFile: jest.fn()
  }
}));

const { Book } = require('../../models/book');

describe('bryanUtil - unit tests', () => {
  let readFile, writeFile;

  beforeEach(() => {
    jest.resetModules();
    readFile = require('fs').promises.readFile;
    writeFile = require('fs').promises.writeFile;
  });

  test('readBooksFile returns parsed JSON when file exists', async () => {
    const sample = JSON.stringify({ books: [{ user: 'u', title: 't' }] });
    readFile.mockResolvedValueOnce(sample);

    const { readBooksFile } = require('../../utils/bryanUtil');
    const data = await readBooksFile();
    expect(data).toEqual(JSON.parse(sample));
  });

  test('readBooksFile falls back to template when books.json missing', async () => {
    const template = JSON.stringify({ books: [] });
    // first call throws (books.json), second call returns template
    readFile.mockRejectedValueOnce(new Error('no file'));
    readFile.mockResolvedValueOnce(template);
    writeFile.mockResolvedValueOnce();

    const { readBooksFile } = require('../../utils/bryanUtil');
    const data = await readBooksFile();
    expect(data).toEqual(JSON.parse(template));
    // ensure writeFile called to create books.json
    expect(writeFile).toHaveBeenCalled();
  });

  test('addBook validates required fields', async () => {
    const { addBook } = require('../../utils/bryanUtil');
    const req = { body: { user: 'a', title: '', author: 'b', content: 'c' } };
    const status = jest.fn().mockReturnValue({ json: jest.fn() });
    const res = { status };
    await addBook(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('addBook prevents duplicate title for same user', async () => {
    const existing = { books: [{ user: 'u', title: 'T', author: 'A', content: 'C' }] };
    readFile.mockResolvedValueOnce(JSON.stringify(existing));

    const { addBook } = require('../../utils/bryanUtil');
    const req = { body: { user: 'u', title: 'T', author: 'A', content: 'C' } };
    const status = jest.fn().mockReturnValue({ json: jest.fn() });
    const res = { status };
    await addBook(req, res);
    expect(status).toHaveBeenCalledWith(409);
  });

  test('addBook writes and returns new book on success', async () => {
    const existing = { books: [] };
    readFile.mockResolvedValueOnce(JSON.stringify(existing));
    writeFile.mockResolvedValueOnce();

    const { addBook } = require('../../utils/bryanUtil');
    const req = { body: { user: 'u', title: 'New', author: 'A', content: 'C' } };

    const json = jest.fn();
    const res = { json };

    await addBook(req, res);

    expect(writeFile).toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Book added' }));
    const returned = json.mock.calls[0][0].book;
    expect(returned).toMatchObject({ user: 'u', title: 'New', author: 'A', content: 'C' });
  });

  test('readBooksFile returns empty and writes file when both files missing', async () => {
    // both reads fail -> fallback to writing empty books
    readFile.mockRejectedValueOnce(new Error('no books'));
    readFile.mockRejectedValueOnce(new Error('no template'));
    writeFile.mockResolvedValueOnce();

    const { readBooksFile } = require('../../utils/bryanUtil');
    const data = await readBooksFile();
    expect(data).toEqual({ books: [] });
    expect(writeFile).toHaveBeenCalled();
  });

  test('addBook handles write error and responds 500', async () => {
    const existing = { books: [] };
    readFile.mockResolvedValueOnce(JSON.stringify(existing));
    writeFile.mockRejectedValueOnce(new Error('disk full'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { addBook } = require('../../utils/bryanUtil');
    const req = { body: { user: 'u', title: 'New2', author: 'A', content: 'C' } };
    const status = jest.fn().mockReturnValue({ json: jest.fn() });
    const res = { status };

    await addBook(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
