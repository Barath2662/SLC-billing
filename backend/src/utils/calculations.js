function calculateTotalKms(startingKms, closingKms) {
  if (startingKms == null || closingKms == null) return 0;
  return Math.max(0, Number(closingKms) - Number(startingKms));
}

function calculateDayCount(tripDate, tripEndDate) {
  if (!tripDate || !tripEndDate) return 1;
  const start = new Date(tripDate);
  const end = new Date(tripEndDate);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function calculateTotalHours(startingTime, closingTime, multipleDays = false, tripDate = null, tripEndDate = null) {
  let timeHours = 0;
  if (startingTime && closingTime) {
    const parseTime = (t) => {
      const parts = t.split(':');
      return Number(parts[0]) + Number(parts[1]) / 60;
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

function calculateChargeableKms(totalKms, freeKms) {
  return Math.max(0, Number(totalKms || 0) - Number(freeKms || 0));
}

function calculateTotalAmount(data) {
  let total = 0;
  const n = (v) => v ? Number(v) : 0;

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

function calculatePayableAmount(totalAmount, advance) {
  return Math.max(0, Math.round((Number(totalAmount || 0) - Number(advance || 0)) * 100) / 100);
}

module.exports = {
  calculateTotalKms,
  calculateDayCount,
  calculateTotalHours,
  calculateChargeableKms,
  calculateTotalAmount,
  calculatePayableAmount,
};
