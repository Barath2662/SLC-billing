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
  const amountCell = (amount, boldRs = false) => {
    const rs = amount != null && amount !== '' ? fmt2(amount) : '';
    const ps = rs ? '00' : '';
    const rsClass = boldRs ? 'right bold' : 'right';
    return `<table style="width:100%; border-collapse:collapse;">
      <tr>
        <td class="${rsClass}" style="width:65%; border:none; border-right:1.5px solid black;">${rs}</td>
        <td class="right" style="width:35%; border:none;">${ps}</td>
      </tr>
    </table>`;
  };

  return `
  <html>
  <head>
    <style>
      @page { size: A4 portrait; margin: 0; }

      body {
        width: 794px;
        margin: 0;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.2;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      td {
        border: 1.5px solid black;
        padding: 3px 4px;
        vertical-align: middle;
      }

      .no-border td {
        border: none;
      }

      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }

      .title {
        font-size: 18px;
        font-weight: bold;
      }

      .small {
        font-size: 11px;
      }
    </style>
  </head>

  <body>

    <table class="no-border">
      <tr>
        <td class="center title">SRII LAKSHMI CAB</td>
      </tr>
      <tr>
        <td class="center small">
          5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur,<br/>
          Coimbatore-641005 | Email: cabsriilakshmi@gmail.com
        </td>
      </tr>
      <tr>
        <td class="center bold small">
          Ph: 94439 14314, 80127 81549, 81482 51567
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="width:60%">To. M/s ${s(bill.customerName)}</td>
        <td style="width:40%; background:#1a2a8f; color:white; font-weight:bold; text-align:center;" class="center bold">
          CASH BILL / INVOICE
        </td>
      </tr>
      <tr>
        <td>GSTIN : ${s(bill.gstin)}</td>
        <td>No. ${s(bill.billNumber)}</td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="width:70%">Travel Details ${s(bill.travelDetails)}</td>
        <td style="width:30%">Date : ${s(date)}</td>
      </tr>
      <tr>
        <td>Vehicle No. ${s(bill.vehicleNumber)}</td>
        <td>Trip Date : ${s(tripDate)}</td>
      </tr>
    </table>

    <table>

      <tr>
        <td style="width:50%">Closing Time ${s(bill.closingTime)}</td>
        <td style="width:25%">Closing Kms ${fmt2(bill.closingKms)}</td>
        <td rowspan="3" style="width:25%; padding:0;">
          <table style="height:100%; border-collapse:collapse;">
            <tr>
              <td class="center bold" style="border-bottom:1.5px solid black;">
                AMOUNT
              </td>
            </tr>
            <tr>
              <td style="padding:0;">
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td class="center bold" style="border-right:1.5px solid black;">Rs.</td>
                    <td class="center bold">Ps.</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td>Starting Time ${s(bill.startingTime)}</td>
        <td>Starting Kms ${fmt2(bill.startingKms)}</td>
      </tr>

      <tr>
        <td>Total Hours ${fmt2(totalHours)}</td>
        <td>Total Kms ${fmt2(totalKms)}</td>
      </tr>

      <tr>
        <td colspan="2">
          Charge per Km Rs. ${fmt2(bill.chargePerKm)} × ${fmt2(chargeableKms)}
        </td>
        <td style="padding:0;">${amountCell(kmAmount, true)}</td>
      </tr>

      <tr>
        <td colspan="2">
          Charge per Hour × ${fmt2(totalHours)}
        </td>
        <td></td>
      </tr>

      <tr>
        <td colspan="2">
          Charge per Day Rs. ${fmt2(bill.chargePerDay)}
        </td>
        <td style="padding:0;">${amountCell(dayAmount, true)}</td>
      </tr>

      <tr>
        <td colspan="2">Toll Charges Rs. ${fmt2(bill.tollCharges) || ''}</td>
        <td style="padding:0;">${amountCell(bill.tollCharges, true)}</td>
      </tr>

      <tr>
        <td colspan="2">Night Halt Charges</td>
        <td></td>
      </tr>

      <tr>
        <td colspan="2">Driver Bata</td>
        <td></td>
      </tr>

      <tr>
        <td colspan="2">Other Expenses / Permit Charges</td>
        <td></td>
      </tr>

      <tr>
        <td colspan="2" class="center bold">TOTAL</td>
        <td style="padding:0;">${amountCell(totalAmount, true)}</td>
      </tr>

      <tr>
        <td colspan="2" class="right">Less: Advance</td>
        <td style="padding:0;">${amountCell(advanceAmount, false)}</td>
      </tr>

      <tr>
        <td colspan="2" class="center bold">PAYABLE AMOUNT</td>
        <td style="padding:0;">${amountCell(payableAmount, true)}</td>
      </tr>

    </table>

    <table>
      <tr>
        <td style="width:70%">
          <b>Rupees :</b> ${rupeesInWords}
        </td>
        <td style="width:30%" class="center">
          For SRII LAKSHMI CAB
        </td>
      </tr>
    </table>

    <table>
      <tr><td class="bold">BANK DETAILS</td></tr>
      <tr><td>ACCOUNT HOLDER: SRII LAKSHMI CAB</td></tr>
      <tr><td>Account number: 35530200000638</td></tr>
      <tr><td>Bank name: BANK OF BARODA</td></tr>
      <tr><td>IFSC CODE: BARB0TRICOI</td></tr>
      <tr><td>Branch: Trichy Road, Coimbatore</td></tr>
    </table>

  </body>
  </html>
  `;
}

module.exports = { generateInvoiceHTML, numberToWords };
