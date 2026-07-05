import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set light theme preference
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
  ]);
  await page.setViewport({ width: 1280, height: 800 });
  
  // Create docs/screenshots dir if not exists
  const screenshotsDir = path.join(__dirname, '../docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("Setting Auth & Navigating to Dashboard...");
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem("praojas_auth", "true");
  });
  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard.png') });
  console.log("Dashboard screenshot saved.");

  console.log("Navigating to Prediction...");
  await page.goto('http://127.0.0.1:3000/patient/P-10001', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, 'prediction.png') });
  console.log("Prediction screenshot saved.");

  console.log("Navigating to Alerts...");
  await page.goto('http://127.0.0.1:3000/alerts', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, 'alerts.png') });
  console.log("Alerts screenshot saved.");

  await browser.close();
  console.log("Done.");
})();
