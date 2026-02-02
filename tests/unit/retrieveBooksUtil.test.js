const fs = require('fs');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('retrieveBooksUtil - unit tests', () => {
  let readFile, writeFile;
  let logSpy, errorSpy;

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetModules();
    readFile = require('fs').promises.readFile;
    writeFile = require('fs').promises.writeFile;
  });

  test('readBooksFile returns parsed JSON when file exists', async () => {
    const sample = JSON.stringify({ books: [{ user: 'u', title: 't' }] });
    readFile.mockResolvedValueOnce(sample);

    const { readBooksFile } = require('../../utils/retrieveBooksUtil');
    const data = await readBooksFile();
    expect(data).toEqual(JSON.parse(sample));
  });

  test('readBooksFile falls back to template when books.json missing', async () => {
    const template = JSON.stringify({ books: [] });
    readFile.mockRejectedValueOnce(new Error('no file'));
    readFile.mockResolvedValueOnce(template);
    writeFile.mockResolvedValueOnce();

    const { readBooksFile } = require('../../utils/retrieveBooksUtil');
    const data = await readBooksFile();
    expect(data).toEqual(JSON.parse(template));
    expect(writeFile).toHaveBeenCalled();
  });

  test('readBooksFile returns empty and writes file when both files missing', async () => {
    readFile.mockRejectedValueOnce(new Error('no books'));
    readFile.mockRejectedValueOnce(new Error('no template'));
    writeFile.mockResolvedValueOnce();

    const { readBooksFile } = require('../../utils/retrieveBooksUtil');
    const data = await readBooksFile();
    expect(data).toEqual({ books: [] });
    expect(writeFile).toHaveBeenCalled();
  });

  test('getBooks responds with books on success', async () => {
    const sample = JSON.stringify({ books: [{ user: 'u', title: 't' }] });
    readFile.mockResolvedValueOnce(sample);

    const { getBooks } = require('../../utils/retrieveBooksUtil');
    const json = jest.fn();
    const res = { json };

    await getBooks({}, res);
    expect(json).toHaveBeenCalledWith({ books: [{ user: 'u', title: 't' }] });
  });

  test('getBooks returns empty array when file has no books property', async () => {
    readFile.mockResolvedValueOnce(JSON.stringify({}));
    const { getBooks } = require('../../utils/retrieveBooksUtil');
    const json = jest.fn();
    const res = { json };

    await getBooks({}, res);
    expect(json).toHaveBeenCalledWith({ books: [] });
  });

  test('getBooks handles readBooksFile error and responds 500', async () => {
    const mod = require('../../utils/retrieveBooksUtil');
    jest.spyOn(mod, 'readBooksFile').mockRejectedValueOnce(new Error('boom'));

    const status = jest.fn().mockReturnValue({ json: jest.fn() });
    const res = { status };
    await mod.getBooks({}, res);
    expect(status).toHaveBeenCalledWith(500);
  });
});
