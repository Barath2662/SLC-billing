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
  const fmt2 = (val) => (val != null && val !== '' ? Number(val).toFixed(2) : '');
  const tripDate = bill.tripDate ? formatDate(bill.tripDate) : '';
  const date = bill.date ? formatDate(bill.date) : '';
  const totalKms = bill.totalKms != null ? Number(bill.totalKms) : 0;
  const totalHours = bill.totalHours != null ? Number(bill.totalHours) : 0;
  const chargeableKms = bill.chargeableKms != null ? Number(bill.chargeableKms) : Math.max(0, totalKms - n(bill.freeKms));
  const dayCount = (() => {
    if (!bill.multipleDays || !bill.tripDate || !bill.tripEndDate) return 1;
    const diff = Math.round((new Date(bill.tripEndDate) - new Date(bill.tripDate)) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  })();

  const kmAmount = bill.kmAmount != null
    ? Number(bill.kmAmount)
    : Math.round(chargeableKms * n(bill.chargePerKm) * 100) / 100;
  const dayAmount = bill.dayAmount != null
    ? Number(bill.dayAmount)
    : Math.round(n(bill.chargePerDay) * dayCount * 100) / 100;
  const totalAmount = bill.totalAmount != null ? Number(bill.totalAmount) : 0;
  const advanceAmount = bill.advance != null ? Number(bill.advance) : 0;
  const payableAmount = bill.payableAmount != null ? Number(bill.payableAmount) : Math.max(0, totalAmount - advanceAmount);
  const rupeesInWords = s(bill.rupeesInWords || numberToWords(totalAmount));
  const amountRs = (amount) => (amount != null && amount !== '' ? fmt2(amount) : '');
  const amountPs = (amount) => (amount != null && amount !== '' ? '00' : '');

  const formatTotalHours = (hoursDecimal) => {
    const hours = Number(hoursDecimal || 0);
    if (!hours) return '0 hrs 0 mins';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hrs ${m} mins`;
  };

  return `
  <html>
  <head>
    <style>
      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        margin: 0;
        padding: 0;
        background: #fff;
        font-size: 12px;
        line-height: 1.2;
      }

      body, table, td {
        font-family: "Times New Roman", Times, serif;
      }

      .page {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .invoice {
        width: 794px;
        background: white;
        border: 2px solid black;
        box-sizing: border-box;
        padding: 0;
        page-break-inside: avoid;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      tr {
        height: 24px;
      }

      td {
        border: 1.2px solid black;
        padding: 5px 6px;
        vertical-align: middle;
        font-size: 12px;
        line-height: 1.2;
      }

      .row-tight { height: 22px; }
      .row-medium { height: 24px; }
      .row-large { height: 32px; }

      .no-border td {
        border: none;
      }

      .center { text-align: center; }
      .right { text-align: right; font-weight: bold; }
      .bold { font-weight: bold; }
      .left { text-align: left; }
      .section td { border-top: 2px solid #000; }

      .header-title {
        font-family: "Times New Roman", serif;
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 2px;
        text-align: center;
      }

      .header-sub {
        font-family: "Times New Roman", serif;
        font-size: 13px;
        text-align: center;
        line-height: 1.4;
      }

      .header-contact {
        font-family: "Times New Roman", serif;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
      }

      .footer td {
        border: none !important;
      }
    </style>
  </head>

  <body>
  <div class="page">
  <div class="invoice">

    <table class="no-border">
      <tr class="row-medium">
        <td class="header-title">SRII LAKSHMI CAB</td>
      </tr>
      <tr class="row-tight">
        <td class="header-sub">
          5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur,<br/>
          Coimbatore-641005 | Email: cabsriilakshmi@gmail.com
        </td>
      </tr>
      <tr class="row-tight">
        <td class="header-contact">
          Ph: 94439 14314, 80127 81549, 81482 51567
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="width:65%; vertical-align:top; padding:6px;">
          <div><b>To. M/s</b> ${s(bill.customerName)}</div>
          <div style="margin-top:6px;">GSTIN :</div>
          <div style="margin-top:10px;">Travel Details : <b>${s(bill.travelDetails)}</b></div>
        </td>
        <td style="width:35%; padding:0;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td class="center bold" style="background:#3b0ca3; color:white; border-bottom:1.5px solid black; letter-spacing:1px;">
                CASH BILL / INVOICE
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>No :</b> <span style="font-size:18px;">${s(bill.billNumber)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Date :</b> ${s(date)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Vehicle No.</b> ${s(bill.vehicleNumber)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Trip Date :</b> ${s(tripDate)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table>
      <tr class="row-medium">
        <td style="width:50%">Closing Time : ${s(bill.closingTime)}</td>
        <td style="width:25%">Closing Kms : ${s(bill.closingKms)}</td>
        <td style="width:15%" colspan="2" class="center bold">AMOUNT</td>
      </tr>

      <tr class="row-medium">
        <td>Starting Time : ${s(bill.startingTime)}</td>
        <td>Starting Kms : ${s(bill.startingKms)}</td>
        <td class="center bold">Rs.</td>
        <td class="center bold">Ps.</td>
      </tr>

      <tr class="row-medium">
        <td>Total Hours : ${formatTotalHours(totalHours)}</td>
        <td>Total Kms : ${s(totalKms)}</td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          Charge per Km : Rs. ${fmt2(bill.chargePerKm)} × ${fmt2(chargeableKms)}
        </td>
        <td class="right">${amountRs(kmAmount)}</td>
        <td class="right">${amountPs(kmAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          Charge per Hour : ${fmt2(totalHours)}
        </td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          Charge per Day : Rs. ${fmt2(bill.chargePerDay)}
        </td>
        <td class="right">${amountRs(dayAmount)}</td>
        <td class="right">${amountPs(dayAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Toll Charges : Rs. ${fmt2(bill.tollCharges) || ''}</td>
        <td class="right">${amountRs(bill.tollCharges)}</td>
        <td class="right">${amountPs(bill.tollCharges)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Night Halt Charges :</td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Driver Bata :</td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Other Expenses / Permit Charges :</td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2" class="center bold">TOTAL</td>
        <td class="right bold">${amountRs(totalAmount)}</td>
        <td class="right bold">${amountPs(totalAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2" class="left" style="text-align:right; font-weight:normal;">Less: Advance</td>
        <td class="right">${amountRs(advanceAmount)}</td>
        <td class="right">${amountPs(advanceAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2" class="center bold">PAYABLE AMOUNT</td>
        <td class="right bold">${amountRs(payableAmount)}</td>
        <td class="right bold">${amountPs(payableAmount)}</td>
      </tr>

    </table>

    <table>
      <tr>
        <td><b>Rupees :</b> ${rupeesInWords}</td>
      </tr>
    </table>

    <table class="footer">
      <tr>
        <td style="width:50%; vertical-align:top; padding:8px;">
          <b>BANK DETAILS</b><br><br>
          ACCOUNT HOLDER: SRII LAKSHMI CAB<br>
          Account number: 35530200000638<br>
          Bank name: BANK OF BARODA<br>
          IFSC CODE: BARB0TRICOI<br>
          Branch: Trichy Road, Coimbatore<br>
          UPI ID: srii94439143638@barodampay
        </td>
        <td style="width:20%; text-align:center; vertical-align:top; padding:8px;">
          <img src="https://res.cloudinary.com/ddhtwszqg/image/upload/q_auto/f_auto/v1776606392/QR_gzxpxv.png" alt="Payment QR" style="width:120px; height:120px; object-fit:contain; display:block; margin:auto;"/>
        </td>
        <td style="width:30%; padding:8px; vertical-align:top; text-align:center;">
          <div style="height:120px; border:1.5px solid black; display:flex; align-items:flex-start; justify-content:center;">
            <span style="margin-top:6px; font-weight:bold;">For SRII LAKSHMI CAB</span>
          </div>
        </td>
      </tr>
    </table>

  </div>
  </div>
  </body>
  </html>
  `;
}

module.exports = { generateInvoiceHTML, numberToWords };
