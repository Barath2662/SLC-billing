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
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function generateInvoiceHTML(bill) {
  const normalizedBill = {
    customerName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    travelDetails: '',
    gstin: '',
    billNumber: '',
    date: '',
    vehicleNumber: '',
    tripDate: '',
    startingTime: '',
    closingTime: '',
    startingKms: 0,
    closingKms: 0,
    totalKms: 0,
    totalHours: 0,
    chargePerKm: 0,
    chargePerHour: 0,
    chargeableKms: 0,
    chargePerDay: 0,
    tollCharges: 0,
    nightHaltCharges: 0,
    driverBata: 0,
    driverBataCount: 1,
    permitCharges: 0,
    otherExpenses: 0,
    kmAmount: null,
    dayAmount: null,
    totalAmount: 0,
    advance: 0,
    payableAmount: 0,
    rupeesInWords: '',
    freeKms: 0,
    multipleDays: false,
    tripEndDate: null,
    ...bill,
  };

  const n = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  const s = (val) => escapeHtml(val || '');
  const showText = (val) => (val === 0 || val === '0' || val == null || val === '' ? '' : s(val));
  const showNum = (val) => (n(val) === 0 ? '' : fmt2(val));
  const fmt2 = (val) => (val != null && val !== '' ? Number(val).toFixed(2) : '');
  const date = normalizedBill.date ? formatDate(normalizedBill.date) : '';
  const formattedTripDateString = (() => {
    if (!normalizedBill.tripDate) return '';
    const d1 = new Date(normalizedBill.tripDate);
    const d2 = normalizedBill.tripEndDate ? new Date(normalizedBill.tripEndDate) : null;
    if (!d2 || isNaN(d2.getTime()) || d1.getTime() === d2.getTime() || !normalizedBill.multipleDays) {
      return formatDate(d1);
    }
    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;
    return `${formatDate(start)} - ${formatDate(end)}`;
  })();

  const totalKms = n(normalizedBill.totalKms);
  const totalHours = n(normalizedBill.totalHours);
  const chargeableKms = normalizedBill.chargeableKms != null ? n(normalizedBill.chargeableKms) : Math.max(0, totalKms - n(normalizedBill.freeKms));
  const dayCount = (() => {
    if (!normalizedBill.multipleDays || !normalizedBill.tripDate || !normalizedBill.tripEndDate) return 1;
    const diff = Math.round((new Date(normalizedBill.tripEndDate) - new Date(normalizedBill.tripDate)) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  })();

  const kmAmount = Math.round(n(normalizedBill.chargePerKm) * chargeableKms * 100) / 100;
  const hourAmount = Math.round(n(normalizedBill.chargePerHour) * totalHours * 100) / 100;
  const dayAmount = normalizedBill.dayAmount != null
    ? n(normalizedBill.dayAmount)
    : Math.round(n(normalizedBill.chargePerDay) * dayCount * 100) / 100;
  const bataAmount = n(normalizedBill.driverBata);
  const bataCount = n(normalizedBill.driverBataCount) || 1;
  const driverBataTotal = Math.round(bataAmount * bataCount * 100) / 100;
  const nightHaltAmount = n(normalizedBill.nightHaltCharges);
  const otherPermitAmount = n(normalizedBill.otherExpenses) + n(normalizedBill.permitCharges);

  const totalAmount = normalizedBill.totalAmount != null && Number(normalizedBill.totalAmount) !== 0
    ? n(normalizedBill.totalAmount)
    : Math.round((kmAmount + hourAmount + dayAmount + n(normalizedBill.tollCharges) + nightHaltAmount + driverBataTotal + otherPermitAmount) * 100) / 100;
  const advanceAmount = normalizedBill.advance != null ? n(normalizedBill.advance) : 0;
  const payableAmount = normalizedBill.payableAmount != null ? n(normalizedBill.payableAmount) : Math.max(0, totalAmount - advanceAmount);
  const rupeesInWords = s(normalizedBill.rupeesInWords || numberToWords(totalAmount));

  const formatAmount = (value) => {
    if (value === null || value === undefined || Number(value) === 0) {
      return { rs: '', ps: '' };
    }

    const fixed = Number(value).toFixed(2);
    const [rs, ps] = fixed.split('.');
    return { rs, ps };
  };
  const amountRs = (amount) => formatAmount(amount).rs;
  const amountPs = (amount) => formatAmount(amount).ps;

  const formatTotalHours = (hoursDecimal) => {
    const hours = Number(hoursDecimal || 0);
    if (!hours) return '';
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
          <div><b>To M/s.</b></div>
          <div style="font-weight:bold;">${s(normalizedBill.customerName)}</div>
          <div>${s(normalizedBill.addressLine1) || '&nbsp;'}</div>
          <div>${s(normalizedBill.addressLine2) || '&nbsp;'}</div>
          <div>${s(normalizedBill.addressLine3) || '&nbsp;'}</div>
          <div style="margin-top:6px;">GSTIN : ${showText(normalizedBill.gstin)}</div>
          <div style="margin-top:6px;">Travel Details : <b>${showText(normalizedBill.travelDetails)}</b></div>
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
                <b>No :</b> <span style="font-size:18px;">${showText(normalizedBill.billNumber)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Date :</b> ${s(date)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Vehicle No.</b> ${showText(normalizedBill.vehicleNumber)}
              </td>
            </tr>
            <tr>
              <td style="padding:4px;">
                <b>Trip Date :</b> ${s(formattedTripDateString)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table>
      <tr class="row-medium">
        <td style="width:50%">Closing Time : ${showText(normalizedBill.closingTime)}</td>
        <td style="width:25%">Closing Kms : ${showNum(normalizedBill.closingKms)}</td>
        <td style="width:15%" colspan="2" class="center bold">AMOUNT</td>
      </tr>

      <tr class="row-medium">
        <td>Starting Time : ${showText(normalizedBill.startingTime)}</td>
        <td>Starting Kms : ${showNum(normalizedBill.startingKms)}</td>
        <td class="center bold">Rs.</td>
        <td class="center bold">Ps.</td>
      </tr>

      <tr class="row-medium">
        <td>Total Hours : ${formatTotalHours(totalHours)}</td>
        <td>Total Kms : ${showNum(totalKms)}</td>
        <td></td>
        <td></td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          ${n(normalizedBill.chargePerKm) > 0 ? `Charge per Km : Rs. ${fmt2(normalizedBill.chargePerKm)} × ${fmt2(chargeableKms)}` : 'Charge per Km :'}
        </td>
        <td class="right">${amountRs(kmAmount)}</td>
        <td class="right">${amountPs(kmAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          ${n(normalizedBill.chargePerHour) > 0 ? `Charge per Hour : Rs. ${fmt2(normalizedBill.chargePerHour)} × ${fmt2(totalHours)}` : 'Charge per Hour :'}
        </td>
        <td class="right">${amountRs(hourAmount)}</td>
        <td class="right">${amountPs(hourAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">
          ${n(normalizedBill.chargePerDay) > 0 ? (dayCount > 1 ? `Charge per Day : Rs. ${fmt2(normalizedBill.chargePerDay)} × ${dayCount} Days` : `Charge per Day : Rs. ${fmt2(normalizedBill.chargePerDay)}`) : 'Charge per Day :'}
        </td>
        <td class="right">${amountRs(dayAmount)}</td>
        <td class="right">${amountPs(dayAmount)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Toll Charges : ${n(normalizedBill.tollCharges) > 0 ? `Rs. ${fmt2(normalizedBill.tollCharges)}` : ''}</td>
        <td class="right">${amountRs(normalizedBill.tollCharges)}</td>
        <td class="right">${amountPs(normalizedBill.tollCharges)}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Night Halt Charges : ${nightHaltAmount > 0 ? `Rs. ${fmt2(nightHaltAmount)}` : ''}</td>
        <td class="right">${amountRs(nightHaltAmount || '')}</td>
        <td class="right">${amountPs(nightHaltAmount || '')}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">${bataAmount > 0 ? `Driver Bata : Rs. ${fmt2(bataAmount)} × ${bataCount}` : 'Driver Bata :'}</td>
        <td class="right">${amountRs(driverBataTotal || '')}</td>
        <td class="right">${amountPs(driverBataTotal || '')}</td>
      </tr>

      <tr class="row-medium">
        <td colspan="2">Other Expenses / Permit Charges :</td>
        <td class="right">${amountRs(otherPermitAmount || '')}</td>
        <td class="right">${amountPs(otherPermitAmount || '')}</td>
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
        <td style="width:20%; text-align:center; vertical-align:top; padding:6px 8px;">
          <div style="font-weight:bold; font-size:12px; margin-bottom:4px; text-align:center;">Scan to Pay</div>
          <img src="https://res.cloudinary.com/ddhtwszqg/image/upload/q_auto/f_auto/v1776606392/QR_gzxpxv.png" alt="Payment QR" style="width:105px; height:105px; object-fit:contain; display:block; margin:auto;"/>
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
