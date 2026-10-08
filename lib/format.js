export const aud = (n, frac = 0) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: frac,
    minimumFractionDigits: frac,
  }).format(n || 0);

export const km = (n) => `${new Intl.NumberFormat("en-AU").format(n || 0)} km`;

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

/** yyyy-mm-dd in local time (for <input type=date>) */
export const isoDate = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

export const addDays = (n) => isoDate(new Date(Date.now() + n * 86400000));

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1f1f26'/><stop offset='1' stop-color='#3a2416'/></linearGradient></defs><rect width='800' height='500' fill='url(#g)'/><g fill='none' stroke='#e8642c' stroke-width='6' stroke-linecap='round' opacity='.8'><path d='M170 320h460M210 320l40-80q20-30 60-30h170q40 0 70 30l70 80'/><circle cx='270' cy='330' r='34'/><circle cx='540' cy='330' r='34'/></g></svg>`,
  );

export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
