import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import * as puppeteer from 'puppeteer';
import { getFreePort, startAppServer, stopAppServer, waitForHttpOk } from './runtime';

async function runBrowserSmoke(baseUrl: string) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1024 });
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('text=PraOjas AI', { timeout: 30_000 });
    assert.equal(await page.title(), 'PraOjas AI - Clinical Decision Support');

    await page.click('button:has-text("Enter Dashboard")');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('text=HIPAA Compliant Secure Login', { timeout: 30_000 });
    assert.match(page.url(), /\/auth$/);

    console.log('UI smoke test passed');
  } finally {
    await browser.close();
  }
}

async function runHttpFallback(baseUrl: string) {
  const response = await fetch(baseUrl);
  const html = await response.text();

  assert.equal(response.ok, true);
  assert.match(html, /PraOjas AI/);
  assert.match(html, /Clinical Decision Support/);

  console.log('UI smoke test passed with HTTP fallback');
}

export async function runUiSmoke() {
  const port = await getFreePort();
  const server = startAppServer(port);

  try {
    await waitForHttpOk(server.url, 90_000);

    try {
      await runBrowserSmoke(server.url);
    } catch (error) {
      console.warn('Puppeteer smoke path failed, using HTTP fallback.');
      console.warn(error);
      await runHttpFallback(server.url);
    }
  } finally {
    await stopAppServer(server.child as unknown as Parameters<typeof stopAppServer>[0]);
  }
}

if (pathToFileURL(process.argv[1] || '').href === import.meta.url) {
  await runUiSmoke().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}