const puppeteer = require('puppeteer');
const { generateInvoiceHTML } = require('./pdfService');

/**
 * Generate PDF using Puppeteer from HTML invoice
 * Returns the same format as displayed in ViewBill page
 */
async function generatePDFFromHTML(bill) {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    const invoiceHtml = generateInvoiceHTML(bill);

    // Set A4 page dimensions
    await page.setViewport({
      width: 794,   // A4 210mm at 96 DPI
      height: 1123, // A4 297mm at 96 DPI
      deviceScaleFactor: 1,
    });

    // Inject optimized CSS for PDF rendering
    const htmlWithOptimizedCSS = invoiceHtml.replace(
      '</head>',
      `<style>
        @page {
          size: A4 portrait;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          table-layout: fixed;
        }
        td, th {
          vertical-align: middle;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        @media print {
          * { margin: 0 !important; padding: 0 !important; }
          body { margin: 0 !important; padding: 0 !important; }
          .bill { margin: 0 !important; padding: 0 !important; break-after: avoid; }
          table { page-break-inside: avoid; }
        }
      </style></head>`
    );

    await page.setContent(htmlWithOptimizedCSS, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 60000,
    });

    await page.waitForTimeout(1000);

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: 0,
      scale: 1,
      printBackground: true,
      preferCSSPageSize: true,
      tagged: false,
      outline: false,
    });

    await page.close();
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Browser close error:', e);
      }
    }
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed: ' + error.message);
  }
}

module.exports = { generatePDFFromHTML };


