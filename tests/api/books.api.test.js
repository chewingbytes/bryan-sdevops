const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

const BOOK_FILE = path.join(__dirname, '..', '..', 'utils', 'books.json');
const BACKUP = BOOK_FILE + '.bak';

let app, server;

beforeAll(async () => {
  // backup
  await fs.copyFile(BOOK_FILE, BACKUP);
  const mod = require('../../index');
  app = mod.app;
  server = mod.server;
});

afterAll(async () => {
  // restore
  await fs.copyFile(BACKUP, BOOK_FILE);
  await fs.unlink(BACKUP).catch(() => {});
  // close server
  server && server.close();
});

describe('API /books tests', () => {
  test('POST /books missing fields -> 400', async () => {
    const res = await request(app).post('/books').send({ user: 'u', title: '', author: 'a' });
    expect(res.status).toBe(400);
  });

  test('POST /books success and GET reflects new book', async () => {
    const payload = { user: 'testuser', title: 'Playwright Test Book', author: 'Tester', content: 'content' };
    const res = await request(app).post('/books').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Book added');

    const list = await request(app).get('/books');
    expect(list.status).toBe(200);
    const found = list.body.books.find(b => b.title === payload.title && b.user === payload.user);
    expect(found).toBeTruthy();
  });

  test('POST duplicate title for same user -> 409', async () => {
    const payload = { user: 'testuser', title: 'Playwright Test Book', author: 'Tester', content: 'content' };
    const res = await request(app).post('/books').send(payload);
    expect(res.status).toBe(409);
  });
});
