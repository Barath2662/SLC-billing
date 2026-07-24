function calculateTotalKms(startingKms, closingKms) {
  if (startingKms == null || closingKms == null || startingKms === '' || closingKms === '') return 0;
  const start = Number(startingKms);
  const close = Number(closingKms);
  if (isNaN(start) || isNaN(close)) return 0;
  return Math.max(0, close - start);
}

function calculateDayCount(tripDate, tripEndDate) {
  if (!tripDate || !tripEndDate) return 1;
  const start = new Date(tripDate);
  const end = new Date(tripEndDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function calculateTotalHours(startingTime, closingTime, multipleDays = false, tripDate = null, tripEndDate = null) {
  let timeHours = 0;
  if (startingTime && closingTime) {
    const parseTime = (t) => {
      if (typeof t !== 'string') return 0;
      const parts = t.split(':');
      if (parts.length < 2) return 0;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (isNaN(h) || isNaN(m)) return 0;
      return h + m / 60;
    };
    let diff = parseTime(closingTime) - parseTime(startingTime);
    if (isNaN(diff)) diff = 0;
    if (diff < 0) diff += 24;
    timeHours = diff;
  }
  if (multipleDays && tripDate && tripEndDate) {
    const dStart = new Date(tripDate);
    const dEnd = new Date(tripEndDate);
    if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
      const daysDiff = Math.max(0, Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24)));
      return Math.round((daysDiff * 24 + timeHours) * 100) / 100;
    }
  }
  const result = Math.round(timeHours * 100) / 100;
  return isNaN(result) ? 0 : result;
}

function calculateChargeableKms(totalKms, freeKms) {
  const tot = Number(totalKms || 0);
  const free = Number(freeKms || 0);
  const safeTot = isNaN(tot) ? 0 : tot;
  const safeFree = isNaN(free) ? 0 : free;
  return Math.max(0, safeTot - safeFree);
}

function calculateTotalAmount(data) {
  let total = 0;
  const n = (v) => {
    if (v == null || v === '') return 0;
    const num = Number(v);
    return isNaN(num) ? 0 : num;
  };

  const dayCount = data.multipleDays ? calculateDayCount(data.tripDate, data.tripEndDate) : 1;
  const chargeableKms = calculateChargeableKms(data.totalKms, data.freeKms);
  const bataCount = data.driverBataCount != null && data.driverBataCount !== '' ? n(data.driverBataCount) : 1;

  total += chargeableKms * n(data.chargePerKm);
  total += n(data.totalHours) * n(data.chargePerHour);
  total += n(data.chargePerDay) * dayCount;
  total += n(data.tollCharges);
  total += n(data.nightHaltCharges);
  total += n(data.driverBata) * (bataCount || 1);
  total += n(data.permitCharges);
  total += n(data.otherExpenses);

  const res = Math.round(total * 100) / 100;
  return isNaN(res) ? 0 : res;
}

function calculatePayableAmount(totalAmount, advance) {
  const tot = Number(totalAmount || 0);
  const adv = Number(advance || 0);
  const safeTot = isNaN(tot) ? 0 : tot;
  const safeAdv = isNaN(adv) ? 0 : adv;
  const res = Math.max(0, Math.round((safeTot - safeAdv) * 100) / 100);
  return isNaN(res) ? 0 : res;
}

function formatHours(decimalHours) {
  if (!decimalHours || decimalHours === 0) return '0';
  const hours = Math.floor(Number(decimalHours));
  const mins = Math.round((Number(decimalHours) - hours) * 60);
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hrs`;
  return `${hours} hrs ${mins} mins`;
}

module.exports = {
  calculateTotalKms,
  calculateDayCount,
  calculateTotalHours,
  calculateChargeableKms,
  calculateTotalAmount,
  calculatePayableAmount,
  formatHours,
};
