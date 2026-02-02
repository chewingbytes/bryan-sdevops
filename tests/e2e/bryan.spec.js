const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

let serverProcess;
const BASE = 'http://localhost:5050';

test.beforeAll(async () => {
  // start the server as a child process
  serverProcess = spawn('node', ['index.js'], { stdio: ['ignore', 'pipe', 'pipe'] });
  // wait for the server to be ready by polling
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 5000);
    serverProcess.stdout.on('data', (d) => {
      const s = d.toString();
      if (s.includes('Demo project at')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    serverProcess.on('error', reject);
  });
});
test.afterAll(() => {
  serverProcess && serverProcess.kill();
});
test('can add a book via UI', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('currentUser', JSON.stringify({ username: 'e2euser' }));
  });
  await page.goto(BASE);

  await page.click('#add-book-btn');
  await page.fill('#book-title', 'E2E Test Title');
  await page.fill('#book-author', 'E2E Author');
  await page.fill('#book-content', 'E2E Content');

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('Book added');
    await dialog.accept();
  });

  await page.click('#save-book-btn');

  // wait for table to refresh
  await page.waitForSelector('tbody#book-list');
  const text = await page.textContent('tbody#book-list');
  expect(text).toContain('E2E Test Title');
});
test('save shows not authenticated when no user', async ({ page }) => {
  await page.goto(BASE);
  await page.click('#add-book-btn');

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('Not authenticated');
    await dialog.accept();
  });

  await page.click('#save-book-btn');
});
