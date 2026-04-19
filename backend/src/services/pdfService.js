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

// Convert 24-hr "HH:MM" to 12-hr "H:MM AM/PM"
function to12hr(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function generateInvoiceHTML(bill) {
  const n = (v) => v != null ? Number(v) : 0;
  const s = (val) => escapeHtml(val || '');
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

  const splitAmt = (val) => {
    const num = Math.round(n(val) * 100) / 100;
    if (num === 0) return ['', ''];
    const rs = Math.floor(num);
    const ps = Math.round((num - rs) * 100);
    return [rs.toString(), ps > 0 ? ps.toString().padStart(2, '0') : '00'];
  };

  const tdAmt = (val) => {
    const [rs, ps] = splitAmt(val);
    return `<td class="amount-rs">${rs || ''}</td><td class="amount-ps">${ps || ''}</td>`;
  };

  const chargeRow = (label, val) => `<tr><td class="desc">${label}</td>${tdAmt(val)}</tr>`;

  const tripDateDisplay = bill.multipleDays
    ? `${formatDate(bill.tripDate)} - ${formatDate(bill.tripEndDate)}`
    : formatDate(bill.tripDate);

  const lineVal = (val) => `<span class="line-val">${s(val)}</span>`;
  const amountWords = s(bill.rupeesInWords || numberToWords(n(bill.totalAmount)));
  const advanceAmount = n(bill.advance);
  const payableAmount = n(bill.payableAmount) || Math.max(0, n(bill.totalAmount) - advanceAmount);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794, initial-scale=1.0">
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      width: 794px;
      margin: 0;
      padding: 0;
      color: #000;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.2;
    }
    .invoice-container {
      width: 794px;
      border: 2px solid #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    tr { height: 28px; }
    td, th {
      border: 1px solid #000;
      padding: 6px;
      font-size: 12px;
      vertical-align: middle;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .no-border { border: 0; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .small { font-size: 10px; }
    .title { font-size: 28px; font-weight: 700; letter-spacing: 2px; }
    .sub-title { font-size: 18px; font-weight: 700; }
    .line-val {
      display: inline-block;
      min-width: 90px;
      border-bottom: 1px dotted #444;
      text-align: center;
      padding: 0 2px;
    }
    .charges td.desc { width: 65%; }
    .charges td.amount-rs { width: 17.5%; text-align: right; font-weight: 700; }
    .charges td.amount-ps { width: 17.5%; text-align: right; font-weight: 700; }
    @media print {
      body { width: 794px; }
      table, tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="invoice-container">
  <table>
    <tr>
      <td class="no-border center" style="border-bottom:2px solid #000; padding:10px 8px;">
        <div class="title">SRII LAKSHMI CAB</div>
        <div class="small" style="margin-top:4px; line-height:1.4;">
          5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur, Coimbatore-641005<br>
          Email: cabsriilakshmi@gmail.com
        </div>
        <div style="margin-top:4px; font-weight:700;">Ph: 94439 14314, 80127 81549, 81482 51567</div>
      </td>
    </tr>
  </table>

  <table>
    <colgroup>
      <col style="width:62%;">
      <col style="width:38%;">
    </colgroup>
    <tr>
      <td style="height:74px;">
        <div><span class="bold">To. M/s:</span> ${s(bill.customerName)}</div>
        <div style="margin-top:12px;"><span class="bold">GSTIN:</span> ${s(bill.gstin)}</div>
      </td>
      <td class="center" style="padding:0;">
        <table>
          <tr><td class="center sub-title" style="background:#0b1f74; color:#fff; font-size:16px;">CASH BILL / INVOICE</td></tr>
          <tr><td class="center" style="height:44px;"><span class="bold">No:</span> <span style="font-size:28px; font-weight:700;">${s(bill.billNumber)}</span></td></tr>
        </table>
      </td>
    </tr>
  </table>

  <table>
    <colgroup>
      <col style="width:62%;">
      <col style="width:38%;">
    </colgroup>
    <tr>
      <td><span class="bold">Travel Details:</span> ${s(bill.travelDetails)}</td>
      <td style="padding:0;">
        <table>
          <tr><td><span class="bold">Date:</span> ${formatDate(bill.date)}</td></tr>
          <tr><td><span class="bold">Vehicle No:</span> ${s(bill.vehicleNumber)}</td></tr>
          <tr><td><span class="bold">Trip Date:</span> ${s(tripDateDisplay)}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <table class="charges">
    <colgroup>
      <col style="width:65%;">
      <col style="width:17.5%;">
      <col style="width:17.5%;">
    </colgroup>
    <tr>
      <td class="desc"><span class="bold">Closing Time:</span> ${lineVal(to12hr(bill.closingTime))} &nbsp; <span class="bold">Closing Kms:</span> ${lineVal(fmt(bill.closingKms))}</td>
      <td class="amount-rs center bold">Rs.</td>
      <td class="amount-ps center bold">Ps.</td>
    </tr>
    <tr>
      <td class="desc"><span class="bold">Starting Time:</span> ${lineVal(to12hr(bill.startingTime))} &nbsp; <span class="bold">Starting Kms:</span> ${lineVal(fmt(bill.startingKms))}</td>
      <td class="amount-rs"></td>
      <td class="amount-ps"></td>
    </tr>
    <tr>
      <td class="desc"><span class="bold">Total Hours:</span> ${lineVal(formatHours(bill.totalHours))} &nbsp; <span class="bold">Total Kms:</span> ${lineVal(fmt(bill.totalKms))}</td>
      <td class="amount-rs"></td>
      <td class="amount-ps"></td>
    </tr>
    ${chargeRow(`Charge per Km: ${lineVal(fmt(bill.chargePerKm))} x ${lineVal(fmt(chargeableKms))}${n(bill.freeKms) > 0 ? ` (Free Kms: ${lineVal(fmt(bill.freeKms))})` : ''}`, chargePerKmAmt)}
    ${chargeRow(`Charge per Hour: ${lineVal(fmt(bill.chargePerHour))} x ${lineVal(formatHours(bill.totalHours))}`, chargePerHourAmt)}
    ${chargeRow(`Charge per Day: ${lineVal(fmt(bill.chargePerDay))} x ${lineVal(dayCount)}`, chargePerDayAmt)}
    ${chargeRow(`Toll Charges: ${lineVal(fmt(bill.tollCharges))}`, n(bill.tollCharges))}
    ${chargeRow(`Night Halt Charges: ${lineVal(fmt(bill.nightHaltCharges))}`, n(bill.nightHaltCharges))}
    ${chargeRow(`Driver Bata: ${lineVal(fmt(bill.driverBata))}`, n(bill.driverBata))}
    ${chargeRow(`Permit Charges: ${lineVal(fmt(bill.permitCharges))}`, n(bill.permitCharges))}
    ${chargeRow(`Other Expenses: ${lineVal(fmt(bill.otherExpenses))}`, n(bill.otherExpenses))}
    ${chargeRow('TOTAL', n(bill.totalAmount))}
    ${advanceAmount > 0 ? chargeRow('LESS: ADVANCE', advanceAmount) : ''}
    ${advanceAmount > 0 ? chargeRow('PAYABLE AMOUNT', payableAmount) : ''}
  </table>

  <table>
    <colgroup>
      <col style="width:65%;">
      <col style="width:35%;">
    </colgroup>
    <tr style="height:130px;">
      <td style="vertical-align:top;">
        <div><span class="bold">Rupees:</span> ${amountWords}</div>
        <div style="margin-top:12px;" class="bold">BANK DETAILS</div>
        <div style="margin-top:4px;">ACCOUNT HOLDER: SRII LAKSHMI CAB</div>
        <div>Account Number: 35530200000638</div>
        <div>Bank Name: BANK OF BARODA</div>
        <div>IFSC Code: BARB0TRICOI</div>
        <div>Branch: Trichy Road, Coimbatore</div>
      </td>
      <td class="center" style="vertical-align:top;">
        <div class="bold">For SRII LAKSHMI CAB</div>
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

module.exports = { generateInvoiceHTML, numberToWords };
