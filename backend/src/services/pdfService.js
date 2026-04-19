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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function generateInvoiceHTML(bill) {
  const n = (v) => v != null ? Number(v) : 0;
  const s = (val) => escapeHtml(val || '');
  const tripDate = bill.tripDate ? formatDate(bill.tripDate) : '';
  const totalAmount = n(bill.totalAmount);
  const chargeableKms = bill.chargeableKms != null ? n(bill.chargeableKms) : Math.max(0, n(bill.totalKms) - n(bill.freeKms));
  const dayCount = (() => {
    if (!bill.multipleDays || !bill.tripDate || !bill.tripEndDate) return 1;
    const diff = Math.round((new Date(bill.tripEndDate) - new Date(bill.tripDate)) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  })();

  const kmAmount = Math.round(chargeableKms * n(bill.chargePerKm) * 100) / 100;
  const dayAmount = Math.round(n(bill.chargePerDay) * dayCount * 100) / 100;
  const rupeesInWords = s(bill.rupeesInWords || numberToWords(totalAmount));

  const amountCell = (amount) => {
    const num = Math.round(n(amount) * 100) / 100;
    if (!num) return { rs: '', ps: '' };
    const rs = Math.floor(num);
    const ps = Math.round((num - rs) * 100);
    return { rs: String(rs), ps: ps > 0 ? String(ps).padStart(2, '0') : '00' };
  };

  const kmCell = amountCell(kmAmount);
  const dayCell = amountCell(dayAmount);
  const tollCell = amountCell(bill.tollCharges);
  const totalCell = amountCell(totalAmount);

  return `
  <html>
  <head>
    <style>
      @page { size: A4 portrait; margin: 0; }

      body {
        width: 794px;
        margin: 0;
        font-family: Arial, sans-serif;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      td, th {
        border: 1px solid black;
        padding: 6px;
        font-size: 12px;
        vertical-align: middle;
        word-break: break-word;
      }

      .no-border td {
        border: none;
      }

      .center {
        text-align: center;
      }

      .right {
        text-align: right;
      }

      .bold {
        font-weight: bold;
      }
    </style>
  </head>

  <body>

    <table class="no-border">
      <tr>
        <td class="center bold" style="font-size:20px;">
          SRII LAKSHMI CAB
        </td>
      </tr>
      <tr>
        <td class="center">
          5/12-AB, 5th Street East, Nanjappa Nagar, Singanallur, Coimbatore
        </td>
      </tr>
      <tr>
        <td class="center bold">
          Ph: 94439 14314, 80127 81549
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="width:60%">To: M/s ${s(bill.customerName)}</td>
        <td style="width:40%" class="right bold">
          CASH BILL / INVOICE<br/>
          No: ${s(bill.billNumber)}
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="width:60%">Travel: ${s(bill.travelDetails)}</td>
        <td style="width:40%">Date: ${s(formatDate(bill.date))}</td>
      </tr>
      <tr>
        <td>Vehicle: ${s(bill.vehicleNumber)}</td>
        <td>Trip Date: ${s(tripDate)}</td>
      </tr>
    </table>

    <table>
      <tr>
        <th style="width:65%">Description</th>
        <th style="width:17.5%">Rs.</th>
        <th style="width:17.5%">Ps.</th>
      </tr>

      <tr>
        <td>Charge per Km</td>
        <td class="right">${kmCell.rs}</td>
        <td class="right">${kmCell.ps}</td>
      </tr>

      <tr>
        <td>Charge per Day</td>
        <td class="right">${dayCell.rs}</td>
        <td class="right">${dayCell.ps}</td>
      </tr>

      <tr>
        <td>Toll Charges</td>
        <td class="right">${tollCell.rs}</td>
        <td class="right">${tollCell.ps}</td>
      </tr>

      <tr>
        <td class="bold">TOTAL</td>
        <td class="right bold">${totalCell.rs}</td>
        <td class="right bold">${totalCell.ps}</td>
      </tr>
    </table>

    <table class="no-border">
      <tr>
        <td>
          Rupees: ${rupeesInWords}
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

module.exports = { generateInvoiceHTML, numberToWords };
