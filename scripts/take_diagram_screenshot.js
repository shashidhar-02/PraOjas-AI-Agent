import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 700 });
  
  const htmlPath = path.join(__dirname, 'diagram.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log("Setting HTML content...");
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting for Tailwind to process CSS classes (4 seconds)...");
  await new Promise(r => setTimeout(r, 4000));
  
  const element = await page.$('.diagram-container');
  if (element) {
      await element.screenshot({ path: path.join(__dirname, '../assets/workflow.png') });
      console.log("Successfully saved premium HTML/CSS diagram to assets/workflow.png");
  } else {
      console.error("Could not find .diagram-container element!");
  }
  
  await browser.close();
})();
