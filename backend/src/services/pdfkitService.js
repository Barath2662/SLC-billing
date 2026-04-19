const puppeteer = require('puppeteer');
const { generateInvoiceHTML } = require('./pdfService');

/**
 * Generate PDF using Puppeteer from HTML invoice
 * Returns the same format as displayed in ViewBill page
 */
async function generatePDFFromHTML(bill) {
  let browser;
  try {
    // Try to launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const invoiceHtml = generateInvoiceHTML(bill);

    await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error('PDF generation failed: ' + error.message);
  }
}

module.exports = { generatePDFFromHTML };

