export function calculateTotalKms(startingKms, closingKms) {
  const s = parseFloat(startingKms) || 0;
  const c = parseFloat(closingKms) || 0;
  return Math.max(0, c - s);
}

// Returns number of days (inclusive) between two date strings, minimum 1
export function calculateDayCount(tripDate, tripEndDate) {
  if (!tripDate || !tripEndDate) return 1;
  const start = new Date(tripDate);
  const end = new Date(tripEndDate);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

// If multiple days: total hours = (daysDiff × 24) + time hours on last day
export function calculateTotalHours(startingTime, closingTime, multipleDays = false, tripDate = null, tripEndDate = null) {
  let timeHours = 0;
  if (startingTime && closingTime) {
    const parseTime = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h + m / 60;
    };
    let diff = parseTime(closingTime) - parseTime(startingTime);
    if (diff < 0) diff += 24;
    timeHours = diff;
  }
  if (multipleDays && tripDate && tripEndDate) {
    const daysDiff = Math.max(0, Math.round((new Date(tripEndDate) - new Date(tripDate)) / (1000 * 60 * 60 * 24)));
    return Math.round((daysDiff * 24 + timeHours) * 100) / 100;
  }
  return Math.round(timeHours * 100) / 100;
}

export function calculateChargeableKms(totalKms, freeKms) {
  return Math.max(0, (parseFloat(totalKms) || 0) - (parseFloat(freeKms) || 0));
}

export function calculatePayableAmount(totalAmount, advance) {
  return Math.max(0, Math.round((parseFloat(totalAmount || 0) - parseFloat(advance || 0)) * 100) / 100);
}

export function calculateTotalAmount(data) {
  let total = 0;
  const n = (v) => parseFloat(v) || 0;

  const dayCount = data.multipleDays ? calculateDayCount(data.tripDate, data.tripEndDate) : 1;
  const chargeableKms = calculateChargeableKms(data.totalKms, data.freeKms);

  total += chargeableKms * n(data.chargePerKm);
  total += n(data.totalHours) * n(data.chargePerHour);
  total += n(data.chargePerDay) * dayCount;
  total += n(data.tollCharges);
  total += n(data.nightHaltCharges);
  total += n(data.driverBata);
  total += n(data.permitCharges);
  total += n(data.otherExpenses);

  return Math.round(total * 100) / 100;
}

export function numberToWords(num) {
  if (!num || num === 0) return 'Zero Rupees Only';

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
  if (intPart >= 10000000) result += convertGroup(Math.floor(intPart / 10000000)) + ' Crore ';
  if (intPart >= 100000) result += convertGroup(Math.floor((intPart % 10000000) / 100000)) + ' Lakh ';
  if (intPart >= 1000) result += convertGroup(Math.floor((intPart % 100000) / 1000)) + ' Thousand ';
  if (intPart >= 100) {
    result += convertGroup(Math.floor((intPart % 1000) / 100)) + ' Hundred ';
    if (intPart % 100 > 0) result += 'and ';
  }
  if (intPart % 100 > 0 || intPart === 0) result += convertGroup(intPart % 100);

  result = result.trim() + ' Rupees';
  if (decPart > 0) result += ' and ' + convertGroup(decPart) + ' Paise';
  result += ' Only';
  return result.replace(/\s+/g, ' ').trim();
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatCurrency(amount) {
  if (amount == null) return '₹ 0.00';
  return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
