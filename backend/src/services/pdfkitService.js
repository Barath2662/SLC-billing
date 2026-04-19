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

    // Set viewport for proper rendering
    await page.setViewport({
      width: 794,  // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 1,
    });

    // Inject print CSS to ensure proper formatting
    const htmlWithPrintCSS = invoiceHtml.replace(
      '</head>',
      `<style>
        @media print {
          * { margin: 0; padding: 0; }
          body { margin: 0; padding: 0; }
          .bill { 
            margin: 0; 
            padding: 0;
            width: 100%;
            box-shadow: none;
          }
          table { width: 100%; }
          td { padding: 6px 8px; }
        }
      </style></head>`
    );

    await page.setContent(htmlWithPrintCSS, { 
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    // Wait a bit for content to render
    await page.waitForTimeout(500);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: 0,
      scale: 1,
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
    throw new Error('PDF generation failed: ' + error.message);
  }
}

module.exports = { generatePDFFromHTML };

