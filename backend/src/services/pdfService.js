const puppeteer = require('puppeteer');
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

  const splitAmt = (val) => {
    const num = Math.round(n(val) * 100) / 100;
    if (num === 0) return ['', ''];
    const rs = Math.floor(num);
    const ps = Math.round((num - rs) * 100);
    return [rs.toString(), ps > 0 ? ps.toString().padStart(2, '0') : '00'];
  };

  // Merge Rs+Ps into one empty cell when amount is zero
  const tdAmt = (val) => {
    const [rs, ps] = splitAmt(val);
    if (!rs && !ps) {
      return `<td colspan="2" style="border:1px solid #000;"></td>`;
    }
    return `<td style="border:1px solid #000;padding:3px 6px;text-align:right;font-size:12px;font-weight:bold;">${rs}</td>
            <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:12px;font-weight:bold;">${ps}</td>`;
  };

  const chargeRow = (labelHtml, val) => `
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:8px 10px;font-size:11px;">${labelHtml}</td>
      ${tdAmt(val)}
    </tr>`;

  const tripDateDisplay = bill.multipleDays
    ? `${formatDate(bill.tripDate)} \u2013 ${formatDate(bill.tripEndDate)}`
    : formatDate(bill.tripDate);

  const dottedVal = (val, width) =>
    `<span style="display:inline-block;min-width:${width || 55}px;border-bottom:1px dotted #444;vertical-align:bottom;padding:0 2px;text-align:center;">${val}</span>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#000; background:#fff; }
    .bill {
      width: 190mm;
      margin: 0 auto;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
    }
    .charges-wrap { }
    table { border-collapse: collapse; width: 100%; }
    td, th { vertical-align: middle; }
  </style>
</head>
<body>
<div class="bill">

  <!-- HEADER -->
  <table style="border-bottom:2px solid #000;">
    <tr>
      <td style="text-align:center;padding:8px 14px;">
        <div style="font-size:24px;font-weight:900;letter-spacing:3px;font-family:'Arial Black',Arial,sans-serif;">SRII LAKSHMI CAB</div>
        <div style="font-size:9px;margin-top:2px;line-height:1.5;">
          5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur,<br>
          Coimbatore-641005. | Email : cabsriilakshmi@gmail.com
        </div>
        <div style="font-size:11px;font-weight:bold;margin-top:2px;">Ph : 94439 14314, 80127 81549, 81482 51567</div>
     <!--   <div style="font-size:10px;font-weight:bold;margin-top:3px;">
          GSTIN :
        </div> -->
      </td>
    </tr>
  </table>

  <!-- TO M/S + GSTIN (customer) + CASH BILL/INVOICE -->
  <table style="border-bottom:1px solid #000;">
    <tr>
      <td style="padding:5px 10px;border-right:1px solid #000;vertical-align:top;">
        <div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:4px;">
          <span style="font-size:11px;white-space:nowrap;">To. M/s</span>
          <span style="flex:1;padding-bottom:1px;font-weight:bold;font-size:12px;">&nbsp;${s(bill.customerName)}</span>
        </div>
        <div style="min-height:14px;margin-bottom:4px;"></div>
        <div style="display:flex;align-items:flex-end;gap:4px;">
          <span style="font-size:10px;white-space:nowrap;">GSTIN :</span>
          <span style="flex:1;padding-bottom:1px;font-size:11px;font-weight:bold;">&nbsp;${s(bill.gstin)}</span>
        </div>
      </td>
      <td style="width:38%;vertical-align:top;">
        <div style="background:#00008B;color:#fff;text-align:center;padding:6px;font-weight:bold;font-size:14px;letter-spacing:1px;border-bottom:1px solid #000;">
          CASH BILL / INVOICE
        </div>
        <div style="padding:4px 12px;font-size:11px;">
          No.&nbsp;&nbsp;<span style="font-size:24px;font-weight:900;font-family:'Arial Black',Arial,sans-serif;">${s(bill.billNumber)}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- TRAVELS DETAILS + DATE / VEHICLE / TRIP DATE -->
  <table style="border-bottom:1px solid #000;">
    <tr>
      <td style="padding:5px 10px;border-right:1px solid #000;vertical-align:top;">
        <div style="display:flex;align-items:flex-start;gap:4px;padding-bottom:3px;">
          <span style="font-size:11px;white-space:nowrap;">Travel Details</span>
          <span style="font-weight:bold;font-size:12px;word-break:break-word;">&nbsp;${s(bill.travelDetails)}</span>
        </div>
      </td>
      <td style="width:38%;vertical-align:top;">
        <table>
          <tr><td style="border-bottom:1px solid #000;padding:4px 10px;font-size:11px;"><b>Date :</b>&nbsp;${formatDate(bill.date)}</td></tr>
          <tr><td style="border-bottom:1px solid #000;padding:4px 10px;font-size:11px;"><b>Vehicle No.</b>&nbsp;${s(bill.vehicleNumber)}</td></tr>
          <tr><td style="padding:4px 10px;font-size:11px;"><b>Trip Date :</b>&nbsp;${tripDateDisplay}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- CHARGES TABLE -->
  <div class="charges-wrap">
  <table>
    <colgroup>
      <col style="width:44%;"/><col style="width:30%;"/><col style="width:14%;"/><col style="width:12%;"/>
    </colgroup>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Closing Time ${dottedVal(to12hr(bill.closingTime), 72)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Closing Kms ${dottedVal(fmt(bill.closingKms), 65)}
      </td>
      <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:13px;">AMOUNT</td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Starting Time ${dottedVal(to12hr(bill.startingTime), 72)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Starting Kms ${dottedVal(fmt(bill.startingKms), 65)}
      </td>
      <td rowspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:12px;">Rs.</td>
      <td rowspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:12px;">Ps.</td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Total Hours ${dottedVal(formatHours(bill.totalHours), 80)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Total Kms ${dottedVal(fmt(bill.totalKms), 80)}
      </td>
    </tr>

    <tr><td colspan="4" style="border:1px solid #000;height:10px;"></td></tr>

    ${chargeRow(
      `Charge per Km Rs. ${dottedVal(fmt(bill.chargePerKm) || '', 50)}&nbsp; Ps. ${dottedVal('', 28)}&nbsp; &times; ${dottedVal(chargeableKms > 0 ? fmt(chargeableKms) : (fmt(bill.totalKms) || ''), 50)}&nbsp; Kms${n(bill.freeKms) > 0 ? `&nbsp;&nbsp; Free Kms ${dottedVal(fmt(bill.freeKms), 45)}` : ''}`,
      chargePerKmAmt
    )}

    ${chargeRow(
      `Charge per Hour Rs. ${dottedVal(fmt(bill.chargePerHour) || '', 50)}&nbsp; Ps. ${dottedVal('', 28)}&nbsp; &times; ${dottedVal(formatHours(bill.totalHours) || '', 70)}`,
      chargePerHourAmt
    )}

    ${chargeRow(
      `Charge per Day Rs. ${dottedVal(fmt(bill.chargePerDay) || '', 68)}&nbsp;&nbsp; For ${dottedVal(dayCount > 1 ? String(dayCount) : '', 38)}&nbsp; days`,
      chargePerDayAmt
    )}

    ${chargeRow(
      `Toll Charges Rs. ${dottedVal(fmt(bill.tollCharges) || '', 80)}`,
      n(bill.tollCharges)
    )}

    ${chargeRow(
      `Night Halt Charges Rs. ${dottedVal(fmt(bill.nightHaltCharges) || '', 70)}&nbsp;&nbsp; Total Nights ${dottedVal('', 55)}`,
      n(bill.nightHaltCharges)
    )}

    ${chargeRow(
      `Driver Bata per Day Rs. ${dottedVal(fmt(bill.driverBata) || '', 70)}&nbsp;&nbsp; Total Days ${dottedVal('', 55)}`,
      n(bill.driverBata)
    )}

    ${chargeRow(
      `Other Expenses ${dottedVal(fmt(bill.otherExpenses) || '', 78)}&nbsp;&nbsp; Permit Charges ${dottedVal(fmt(bill.permitCharges) || '', 78)}`,
      n(bill.otherExpenses) + n(bill.permitCharges)
    )}

    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:14px;font-weight:bold;text-align:right;letter-spacing:2px;">TOTAL</td>
      ${tdAmt(bill.totalAmount)}
    </tr>

    ${n(bill.advance) > 0 ? `
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:12px;text-align:right;">Less: Advance</td>
      ${tdAmt(n(bill.advance))}
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:14px;font-weight:bold;text-align:right;letter-spacing:2px;">PAYABLE AMOUNT</td>
      ${tdAmt(n(bill.payableAmount) || Math.max(0, n(bill.totalAmount) - n(bill.advance)))}
    </tr>
    ` : ''}

    <!-- FOOTER — same table, same colgroup → borders align perfectly -->
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:8px 10px 2px 10px;vertical-align:top;">
        <div style="display:flex;align-items:flex-start;gap:4px;">
          <span style="font-size:13px;font-weight:bold;white-space:nowrap;">Rupees :</span>
          <span style="flex:1;font-weight:bold;font-style:italic;font-size:13px;">&nbsp;${s(bill.rupeesInWords)}</span>
        </div>
        <div style="border-top:1px solid #000;margin:8px 0 6px 0;"></div>
        <div style="margin-top:0;font-size:11px;line-height:1.4;margin-bottom:0;">
          <div style="font-weight:bold;margin-bottom:2px;">BANK DETAILS</div>
          <div><b>ACCOUNT HOLDER:</b> SRII LAKSHMI CAB</div>
          <div><b>Account number:</b> 35530200000638</div>
          <div><b>Bank name:</b> BANK OF BARODA</div>
          <div><b>IFCS CODE:</b> BARB0TRICOI</div>
          <div><b>Branch:</b> Trichy Road, Coimbatore</div>
        </div>
      </td>
      <td colspan="2" style="border:1px solid #000;text-align:center;font-weight:bold;font-size:13px;font-style:italic;vertical-align:top;padding:0;">
        <div style="border-bottom:1px solid #000;padding:8px 4px;">For SRII LAKSHMI CAB</div>
        <div style="min-height:120px;"></div>
      </td>
    </tr>
  </table>
  </div>

</div>
</body>
</html>`;
}



function generateInvoiceHTML(bill) {
  const n = (v) => v != null ? Number(v) : 0;
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

  const splitAmt = (val) => {
    const num = Math.round(n(val) * 100) / 100;
    if (num === 0) return ['', ''];
    const rs = Math.floor(num);
    const ps = Math.round((num - rs) * 100);
    return [rs.toString(), ps > 0 ? ps.toString().padStart(2, '0') : '00'];
  };

  // Merge Rs+Ps into one empty cell when amount is zero
  const tdAmt = (val) => {
    const [rs, ps] = splitAmt(val);
    if (!rs && !ps) {
      return `<td colspan="2" style="border:1px solid #000;"></td>`;
    }
    return `<td style="border:1px solid #000;padding:3px 6px;text-align:right;font-size:12px;font-weight:bold;">${rs}</td>
            <td style="border:1px solid #000;padding:3px 4px;text-align:right;font-size:12px;font-weight:bold;">${ps}</td>`;
  };

  const chargeRow = (labelHtml, val) => `
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:8px 10px;font-size:11px;">${labelHtml}</td>
      ${tdAmt(val)}
    </tr>`;

  const tripDateDisplay = bill.multipleDays
    ? `${formatDate(bill.tripDate)} \u2013 ${formatDate(bill.tripEndDate)}`
    : formatDate(bill.tripDate);

  const dottedVal = (val, width) =>
    `<span style="display:inline-block;min-width:${width || 55}px;border-bottom:1px dotted #444;vertical-align:bottom;padding:0 2px;text-align:center;">${val}</span>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#000; background:#fff; }
    .bill {
      width: 190mm;
      margin: 0 auto;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
    }
    .charges-wrap { }
    table { border-collapse: collapse; width: 100%; }
    td, th { vertical-align: middle; }
  </style>
</head>
<body>
<div class="bill">

  <!-- HEADER -->
  <table style="border-bottom:2px solid #000;">
    <tr>
      <td style="text-align:center;padding:8px 14px;">
        <div style="font-size:24px;font-weight:900;letter-spacing:3px;font-family:'Arial Black',Arial,sans-serif;">SRII LAKSHMI CAB</div>
        <div style="font-size:9px;margin-top:2px;line-height:1.5;">
          5/12-AB, 5th Street East, Nanjappa Nagar, Boat house West, Singanallur,<br>
          Coimbatore-641005. | Email : cabsriilakshmi@gmail.com
        </div>
        <div style="font-size:11px;font-weight:bold;margin-top:2px;">Ph : 94439 14314, 80127 81549, 81482 51567</div>
     <!--   <div style="font-size:10px;font-weight:bold;margin-top:3px;">
          GSTIN :
        </div> -->
      </td>
    </tr>
  </table>

  <!-- TO M/S + GSTIN (customer) + CASH BILL/INVOICE -->
  <table style="border-bottom:1px solid #000;">
    <tr>
      <td style="padding:5px 10px;border-right:1px solid #000;vertical-align:top;">
        <div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:4px;">
          <span style="font-size:11px;white-space:nowrap;">To. M/s</span>
          <span style="flex:1;padding-bottom:1px;font-weight:bold;font-size:12px;">&nbsp;${s(bill.customerName)}</span>
        </div>
        <div style="min-height:14px;margin-bottom:4px;"></div>
        <div style="display:flex;align-items:flex-end;gap:4px;">
          <span style="font-size:10px;white-space:nowrap;">GSTIN :</span>
          <span style="flex:1;padding-bottom:1px;font-size:11px;font-weight:bold;">&nbsp;${s(bill.gstin)}</span>
        </div>
      </td>
      <td style="width:38%;vertical-align:top;">
        <div style="background:#00008B;color:#fff;text-align:center;padding:6px;font-weight:bold;font-size:14px;letter-spacing:1px;border-bottom:1px solid #000;">
          CASH BILL / INVOICE
        </div>
        <div style="padding:4px 12px;font-size:11px;">
          No.&nbsp;&nbsp;<span style="font-size:24px;font-weight:900;font-family:'Arial Black',Arial,sans-serif;">${s(bill.billNumber)}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- TRAVELS DETAILS + DATE / VEHICLE / TRIP DATE -->
  <table style="border-bottom:1px solid #000;">
    <tr>
      <td style="padding:5px 10px;border-right:1px solid #000;vertical-align:top;">
        <div style="display:flex;align-items:flex-start;gap:4px;padding-bottom:3px;">
          <span style="font-size:11px;white-space:nowrap;">Travel Details</span>
          <span style="font-weight:bold;font-size:12px;word-break:break-word;">&nbsp;${s(bill.travelDetails)}</span>
        </div>
      </td>
      <td style="width:38%;vertical-align:top;">
        <table>
          <tr><td style="border-bottom:1px solid #000;padding:4px 10px;font-size:11px;"><b>Date :</b>&nbsp;${formatDate(bill.date)}</td></tr>
          <tr><td style="border-bottom:1px solid #000;padding:4px 10px;font-size:11px;"><b>Vehicle No.</b>&nbsp;${s(bill.vehicleNumber)}</td></tr>
          <tr><td style="padding:4px 10px;font-size:11px;"><b>Trip Date :</b>&nbsp;${tripDateDisplay}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- CHARGES TABLE -->
  <div class="charges-wrap">
  <table>
    <colgroup>
      <col style="width:44%;"/><col style="width:30%;"/><col style="width:14%;"/><col style="width:12%;"/>
    </colgroup>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Closing Time ${dottedVal(to12hr(bill.closingTime), 72)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Closing Kms ${dottedVal(fmt(bill.closingKms), 65)}
      </td>
      <td colspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:13px;">AMOUNT</td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Starting Time ${dottedVal(to12hr(bill.startingTime), 72)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Starting Kms ${dottedVal(fmt(bill.startingKms), 65)}
      </td>
      <td rowspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:12px;">Rs.</td>
      <td rowspan="2" style="border:1px solid #000;padding:3px 4px;font-weight:bold;text-align:center;font-size:12px;">Ps.</td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Total Hours ${dottedVal(formatHours(bill.totalHours), 80)}
      </td>
      <td style="border:1px solid #000;padding:5px 10px;font-size:11px;">
        Total Kms ${dottedVal(fmt(bill.totalKms), 80)}
      </td>
    </tr>

    <tr><td colspan="4" style="border:1px solid #000;height:10px;"></td></tr>

    ${chargeRow(
      `Charge per Km Rs. ${dottedVal(fmt(bill.chargePerKm) || '', 50)}&nbsp; Ps. ${dottedVal('', 28)}&nbsp; &times; ${dottedVal(chargeableKms > 0 ? fmt(chargeableKms) : (fmt(bill.totalKms) || ''), 50)}&nbsp; Kms${n(bill.freeKms) > 0 ? `&nbsp;&nbsp; Free Kms ${dottedVal(fmt(bill.freeKms), 45)}` : ''}`,
      chargePerKmAmt
    )}

    ${chargeRow(
      `Charge per Hour Rs. ${dottedVal(fmt(bill.chargePerHour) || '', 50)}&nbsp; Ps. ${dottedVal('', 28)}&nbsp; &times; ${dottedVal(formatHours(bill.totalHours) || '', 70)}`,
      chargePerHourAmt
    )}

    ${chargeRow(
      `Charge per Day Rs. ${dottedVal(fmt(bill.chargePerDay) || '', 68)}&nbsp;&nbsp; For ${dottedVal(dayCount > 1 ? String(dayCount) : '', 38)}&nbsp; days`,
      chargePerDayAmt
    )}

    ${chargeRow(
      `Toll Charges Rs. ${dottedVal(fmt(bill.tollCharges) || '', 80)}`,
      n(bill.tollCharges)
    )}

    ${chargeRow(
      `Night Halt Charges Rs. ${dottedVal(fmt(bill.nightHaltCharges) || '', 70)}&nbsp;&nbsp; Total Nights ${dottedVal('', 55)}`,
      n(bill.nightHaltCharges)
    )}

    ${chargeRow(
      `Driver Bata per Day Rs. ${dottedVal(fmt(bill.driverBata) || '', 70)}&nbsp;&nbsp; Total Days ${dottedVal('', 55)}`,
      n(bill.driverBata)
    )}

    ${chargeRow(
      `Other Expenses ${dottedVal(fmt(bill.otherExpenses) || '', 78)}&nbsp;&nbsp; Permit Charges ${dottedVal(fmt(bill.permitCharges) || '', 78)}`,
      n(bill.otherExpenses) + n(bill.permitCharges)
    )}

    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:14px;font-weight:bold;text-align:right;letter-spacing:2px;">TOTAL</td>
      ${tdAmt(bill.totalAmount)}
    </tr>

    ${n(bill.advance) > 0 ? `
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:12px;text-align:right;">Less: Advance</td>
      ${tdAmt(n(bill.advance))}
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:7px 10px;font-size:14px;font-weight:bold;text-align:right;letter-spacing:2px;">PAYABLE AMOUNT</td>
      ${tdAmt(n(bill.payableAmount) || Math.max(0, n(bill.totalAmount) - n(bill.advance)))}
    </tr>
    ` : ''}

    <!-- FOOTER — same table, same colgroup → borders align perfectly -->
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:8px 10px 2px 10px;vertical-align:top;">
        <div style="display:flex;align-items:flex-start;gap:4px;">
          <span style="font-size:13px;font-weight:bold;white-space:nowrap;">Rupees :</span>
          <span style="flex:1;font-weight:bold;font-style:italic;font-size:13px;">&nbsp;${s(bill.rupeesInWords)}</span>
        </div>
        <div style="border-top:1px solid #000;margin:8px 0 6px 0;"></div>
        <div style="margin-top:0;font-size:11px;line-height:1.4;margin-bottom:0;">
          <div style="font-weight:bold;margin-bottom:2px;">BANK DETAILS</div>
          <div><b>ACCOUNT HOLDER:</b> SRII LAKSHMI CAB</div>
          <div><b>Account number:</b> 35530200000638</div>
          <div><b>Bank name:</b> BANK OF BARODA</div>
          <div><b>IFCS CODE:</b> BARB0TRICOI</div>
          <div><b>Branch:</b> Trichy Road, Coimbatore</div>
        </div>
      </td>
      <td colspan="2" style="border:1px solid #000;text-align:center;font-weight:bold;font-size:13px;font-style:italic;vertical-align:top;padding:0;">
        <div style="border-bottom:1px solid #000;padding:8px 4px;">For SRII LAKSHMI CAB</div>
        <div style="min-height:120px;"></div>
      </td>
    </tr>
  </table>
  </div>

</div>
</body>
</html>`;
}


async function generatePDF(bill) {
  const html = generateInvoiceHTML(bill);

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    try {
      launchOptions.executablePath = puppeteer.executablePath();
    } catch (err) {
      // Let Puppeteer auto-resolve the browser if executablePath is unavailable.
    }
  }

  let browser;
  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      timeout: 60000,
    });

    // Puppeteer v21+ returns Uint8Array; convert to Buffer so Express sends raw bytes
    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generatePDF, generateInvoiceHTML, numberToWords };
