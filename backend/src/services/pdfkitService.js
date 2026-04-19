const PDFDocument = require('pdfkit');
const { formatHours } = require('../utils/calculations');

function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
  }

  const intPart = Math.floor(Math.abs(num));
  const decPart = Math.round((Math.abs(num) - intPart) * 100);

  let result = '';
  
  if (intPart >= 10000000) {
    result += convertGroup(Math.floor(intPart / 10000000)) + ' Crore ';
  }
  if (intPart >= 100000) {
    result += convertGroup(Math.floor((intPart % 10000000) / 100000)) + ' Lakh ';
  }
  if (intPart >= 1000) {
    result += convertGroup(Math.floor((intPart % 100000) / 1000)) + ' Thousand ';
  }
  if (intPart >= 100) {
    result += convertGroup(Math.floor((intPart % 1000) / 100)) + ' Hundred ';
    if (intPart % 100 > 0) result += 'and ';
  }
  if (intPart % 100 > 0 || intPart === 0) {
    result += convertGroup(intPart % 100);
  }

  result = result.trim() + ' Rupees';

  if (decPart > 0) {
    result += ' and ' + convertGroup(decPart) + ' Paise';
  }

  result += ' Only';
  return result.replace(/\s+/g, ' ').trim();
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function to12hr(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function splitAmount(val) {
  const num = Math.round(Number(val || 0) * 100) / 100;
  if (num === 0) return [0, 0];
  const rs = Math.floor(num);
  const ps = Math.round((num - rs) * 100);
  return [rs, ps];
}

async function generatePDFWithPDFKit(bill) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 20 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Helper functions
      const n = (v) => (v != null ? Number(v) : 0);
      const s = (val) => val || '';
      const fmt = (val) => (val != null && Number(val) !== 0) ? Number(val).toFixed(2) : '';

      const chargeableKms = bill.chargeableKms != null ? n(bill.chargeableKms) : Math.max(0, n(bill.totalKms) - n(bill.freeKms));
      const chargePerKmAmt = Math.round(chargeableKms * n(bill.chargePerKm) * 100) / 100;
      const chargePerHourAmt = Math.round(n(bill.totalHours) * n(bill.chargePerHour) * 100) / 100;

      const dayCount = (() => {
        if (!bill.multipleDays || !bill.tripDate || !bill.tripEndDate) return 1;
        const diff = Math.round((new Date(bill.tripEndDate) - new Date(bill.tripDate)) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff + 1);
      })();
      const chargePerDayAmt = Math.round(n(bill.chargePerDay) * dayCount * 100) / 100;

      const tripDateDisplay = bill.multipleDays
        ? `${formatDate(bill.tripDate)} – ${formatDate(bill.tripEndDate)}`
        : formatDate(bill.tripDate);

      // Header
      doc.font('Helvetica-Bold').fontSize(20).text('SRII LAKSHMI CAB', { align: 'center' });
      doc.font('Helvetica').fontSize(9).text('5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur,', { align: 'center' });
      doc.fontSize(9).text('Coimbatore-641005. | Email : cabsriilakshmi@gmail.com', { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(10).text('Ph : 94439 14314, 80127 81549, 81482 51567', { align: 'center' });

      doc.moveTo(20, doc.y).lineTo(575, doc.y).stroke();
      doc.moveDown(0.3);

      // Title
      doc.font('Helvetica-Bold').fontSize(14).text('CASH BILL / INVOICE', { align: 'center' });
      doc.moveDown(0.3);

      // Bill info grid
      doc.font('Helvetica').fontSize(10);
      const infoY = doc.y;
      doc.text(`No. ${bill.billNumber}`, 20, infoY);
      doc.text(`Date : ${formatDate(bill.date)}`, 350, infoY);
      doc.text(`Vehicle No. ${s(bill.vehicleNumber)}`, 20, infoY + 15);
      doc.text(`Trip Date : ${tripDateDisplay}`, 350, infoY + 15);

      doc.moveDown(2);

      // Customer info
      doc.font('Helvetica-Bold').fontSize(10).text('To. M/s', 20, doc.y);
      doc.font('Helvetica').fontSize(10).text(s(bill.customerName), 60, doc.y - 12);
      doc.moveDown(0.8);
      if (bill.gstin) {
        doc.font('Helvetica-Bold').fontSize(9).text('GSTIN :', 20, doc.y);
        doc.font('Helvetica').fontSize(9).text(s(bill.gstin), 60, doc.y - 10);
        doc.moveDown(0.6);
      }

      if (bill.travelDetails) {
        doc.font('Helvetica-Bold').fontSize(9).text('Travel Details :', 20, doc.y);
        doc.font('Helvetica').fontSize(9).text(s(bill.travelDetails), 20, doc.y + 12);
        doc.moveDown(1);
      }

      doc.moveDown(0.5);

      // Trip details table
      const tableY = doc.y;
      const colWidth = 190;
      const rowHeight = 18;

      doc.rect(20, tableY, colWidth, rowHeight).stroke();
      doc.text('Closing Time', 30, tableY + 4, { width: 80 });
      doc.text(s(bill.closingTime), 110, tableY + 4);
      doc.text('Closing Kms', 240, tableY + 4, { width: 80 });
      doc.text(n(bill.closingKms).toFixed(2), 330, tableY + 4);

      doc.rect(20, tableY + rowHeight, colWidth, rowHeight).stroke();
      doc.text('Starting Time', 30, tableY + rowHeight + 4, { width: 80 });
      doc.text(s(bill.startingTime), 110, tableY + rowHeight + 4);
      doc.text('Starting Kms', 240, tableY + rowHeight + 4, { width: 80 });
      doc.text(n(bill.startingKms).toFixed(2), 330, tableY + rowHeight + 4);

      doc.rect(20, tableY + rowHeight * 2, colWidth, rowHeight).stroke();
      doc.text('Total Hours', 30, tableY + rowHeight * 2 + 4, { width: 80 });
      doc.text(s(bill.totalHours), 110, tableY + rowHeight * 2 + 4);
      doc.text('Total Kms', 240, tableY + rowHeight * 2 + 4, { width: 80 });
      doc.text(n(bill.totalKms).toFixed(2), 330, tableY + rowHeight * 2 + 4);

      doc.moveDown(3.5);

      // Charges table
      const chargesY = doc.y;
      const chargesRowHeight = 16;
      const colLeft = 20;
      const colRsWidth = 40;
      const colRs = 360;
      const colPs = 420;

      // Header
      doc.font('Helvetica-Bold').fontSize(8);
      doc.rect(colLeft, chargesY, colRs - colLeft, chargesRowHeight).stroke();
      doc.text('Charge per Km Rs.', colLeft + 5, chargesY + 4);
      doc.text(fmt(bill.chargePerKm), 150, chargesY + 4);
      doc.text('x', 200, chargesY + 4);
      doc.text(n(chargeableKms).toFixed(2), 220, chargesY + 4);
      doc.text('Kms', 280, chargesY + 4);

      doc.rect(colRs, chargesY, colPs - colRs, chargesRowHeight).stroke();
      doc.rect(colPs, chargesY, 80, chargesRowHeight).stroke();
      const [rs1, ps1] = splitAmount(chargePerKmAmt);
      doc.font('Helvetica-Bold').fontSize(9).text(rs1.toString(), colRs + 5, chargesY + 3);
      doc.text(ps1.toString().padStart(2, '0'), colPs + 5, chargesY + 3);

      // Charge per hour
      doc.font('Helvetica').fontSize(8);
      doc.rect(colLeft, chargesY + chargesRowHeight, colRs - colLeft, chargesRowHeight).stroke();
      doc.text('Charge per Hour Rs.', colLeft + 5, chargesY + chargesRowHeight + 4);
      doc.text(fmt(bill.chargePerHour), 150, chargesY + chargesRowHeight + 4);
      doc.text('x', 200, chargesY + chargesRowHeight + 4);
      doc.text(n(bill.totalHours).toFixed(2), 220, chargesY + chargesRowHeight + 4);
      doc.text('hrs', 280, chargesY + chargesRowHeight + 4);

      doc.rect(colRs, chargesY + chargesRowHeight, colPs - colRs, chargesRowHeight).stroke();
      doc.rect(colPs, chargesY + chargesRowHeight, 80, chargesRowHeight).stroke();
      const [rs2, ps2] = splitAmount(chargePerHourAmt);
      doc.font('Helvetica-Bold').fontSize(9).text(rs2.toString(), colRs + 5, chargesY + chargesRowHeight + 3);
      doc.text(ps2.toString().padStart(2, '0'), colPs + 5, chargesY + chargesRowHeight + 3);

      // Charge per day
      doc.font('Helvetica').fontSize(8);
      doc.rect(colLeft, chargesY + chargesRowHeight * 2, colRs - colLeft, chargesRowHeight).stroke();
      doc.text('Charge per Day Rs.', colLeft + 5, chargesY + chargesRowHeight * 2 + 4);
      doc.text(fmt(bill.chargePerDay), 150, chargesY + chargesRowHeight * 2 + 4);
      doc.text('For', 200, chargesY + chargesRowHeight * 2 + 4);
      doc.text(dayCount.toString(), 220, chargesY + chargesRowHeight * 2 + 4);
      doc.text('days', 250, chargesY + chargesRowHeight * 2 + 4);

      doc.rect(colRs, chargesY + chargesRowHeight * 2, colPs - colRs, chargesRowHeight).stroke();
      doc.rect(colPs, chargesY + chargesRowHeight * 2, 80, chargesRowHeight).stroke();
      const [rs3, ps3] = splitAmount(chargePerDayAmt);
      doc.font('Helvetica-Bold').fontSize(9).text(rs3.toString(), colRs + 5, chargesY + chargesRowHeight * 2 + 3);
      doc.text(ps3.toString().padStart(2, '0'), colPs + 5, chargesY + chargesRowHeight * 2 + 3);

      // Other charges
      const otherCharges = [
        { label: 'Toll Charges Rs.', value: bill.tollCharges },
        { label: 'Night Halt Charges Rs.', value: bill.nightHaltCharges },
        { label: 'Driver Bata per Day Rs.', value: bill.driverBata },
        { label: 'Other Expenses', value: bill.otherExpenses },
      ];

      let chargeIndex = 3;
      otherCharges.forEach(charge => {
        if (charge.value != null && Number(charge.value) !== 0) {
          const y = chargesY + chargesRowHeight * chargeIndex;
          doc.font('Helvetica').fontSize(8);
          doc.rect(colLeft, y, colRs - colLeft, chargesRowHeight).stroke();
          doc.text(charge.label, colLeft + 5, y + 4);
          doc.text(fmt(charge.value), 280, y + 4);
          doc.rect(colRs, y, colPs - colRs, chargesRowHeight).stroke();
          doc.rect(colPs, y, 80, chargesRowHeight).stroke();
          const [rs, ps] = splitAmount(charge.value);
          doc.font('Helvetica-Bold').fontSize(9).text(rs.toString(), colRs + 5, y + 3);
          doc.text(ps.toString().padStart(2, '0'), colPs + 5, y + 3);
          chargeIndex++;
        }
      });

      // Total
      const totalY = chargesY + chargesRowHeight * (chargeIndex + 0.5);
      doc.font('Helvetica-Bold').fontSize(10);
      doc.rect(colLeft, totalY, colRs - colLeft, chargesRowHeight).stroke();
      doc.text('TOTAL', colLeft + 5, totalY + 4);
      doc.rect(colRs, totalY, colPs - colRs, chargesRowHeight).stroke();
      doc.rect(colPs, totalY, 80, chargesRowHeight).stroke();
      const [rsTotal, psTotal] = splitAmount(bill.totalAmount);
      doc.text(rsTotal.toString(), colRs + 5, totalY + 3);
      doc.text(psTotal.toString().padStart(2, '0'), colPs + 5, totalY + 3);

      // Amount in words
      doc.moveDown(2);
      doc.font('Helvetica').fontSize(9).text(`Amount in Words : ${bill.rupeesInWords || numberToWords(bill.totalAmount)}`);

      // Advance and payable
      if (bill.advance > 0) {
        const advanceY = doc.y + 10;
        doc.text(`Advance Paid: Rs. ${n(bill.advance).toFixed(2)}`, 20, advanceY);
        doc.text(`Payable Amount: Rs. ${n(bill.payableAmount).toFixed(2)}`, 20, advanceY + 15);
      }

      // Footer
      doc.moveDown(2);
      doc.moveTo(20, doc.y).lineTo(575, doc.y).stroke();
      doc.font('Helvetica').fontSize(8).text('Terms & Conditions: Payment should be made within 7 days. Thank you for your business!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDFWithPDFKit, numberToWords };
