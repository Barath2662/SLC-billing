const puppeteer = require('puppeteer');
const { generateInvoiceHTML } = require('./pdfService');

/**
 * Generate PDF using Puppeteer from HTML invoice
 * Returns the same format as displayed in ViewBill page
 */
async function generatePDFFromHTML(bill) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    const html = generateInvoiceHTML(bill);

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 60000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
      scale: 1,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    throw new Error('PDF generation failed: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generatePDFFromHTML };


