const fs = require('fs');
const puppeteer = require('puppeteer');
const { generateInvoiceHTML } = require('./pdfService');

/**
 * Generate PDF using Puppeteer from HTML invoice
 * Returns the same format as displayed in ViewBill page
 */
async function generatePDFFromHTML(htmlOrBill) {
  let browser;
  try {
    const executablePath = (() => {
      if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
      }
      const chromiumFallback = '/usr/bin/chromium-browser';
      if (fs.existsSync(chromiumFallback)) {
        return chromiumFallback;
      }
      return undefined;
    })();

    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      timeout: 60000,
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    const html = typeof htmlOrBill === 'string' ? htmlOrBill : generateInvoiceHTML(htmlOrBill);

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
      timeout: 60000,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
      scale: 1,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('❌ Puppeteer Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generatePDFFromHTML };


