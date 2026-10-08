// All prices are AUD and GST-inclusive (Australian Consumer Law requires the total price to be shown).
const EXTRAS_PER_DAY = {
  insurance: { standard: 0, premium: 25, 'zero-excess': 39 },
  childSeat: 12,
  gps: 9,
  etag: 6, // toll tag for Sydney / Melbourne / Brisbane toll roads
  additionalDriver: 8,
};

const MS_DAY = 24 * 60 * 60 * 1000;

function countDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  return Math.max(1, Math.ceil((e - s) / MS_DAY));
}

function longHireDiscount(days) {
  if (days >= 28) return 0.2;
  if (days >= 14) return 0.12;
  if (days >= 7) return 0.08;
  return 0;
}

function quote(car, { startDate, endDate, extras = {} }) {
  const days = countDays(startDate, endDate);
  const base = car.pricePerDay * days;
  const discountRate = longHireDiscount(days);
  const discount = +(base * discountRate).toFixed(2);
  const subtotal = +(base - discount).toFixed(2);

  let perDay = EXTRAS_PER_DAY.insurance[extras.insurance || 'standard'] || 0;
  if (extras.childSeat) perDay += EXTRAS_PER_DAY.childSeat;
  if (extras.gps) perDay += EXTRAS_PER_DAY.gps;
  if (extras.etag) perDay += EXTRAS_PER_DAY.etag;
  if (extras.additionalDriver) perDay += EXTRAS_PER_DAY.additionalDriver;
  const extrasTotal = +(perDay * days).toFixed(2);

  const total = +(subtotal + extrasTotal).toFixed(2);
  const gst = +(total / 11).toFixed(2); // GST component of a GST-inclusive price
  return { days, base, discountRate, discount, subtotal, extrasTotal, total, gst };
}

module.exports = { quote, countDays, EXTRAS_PER_DAY };
