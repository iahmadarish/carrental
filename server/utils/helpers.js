const crypto = require('crypto');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

const makeOtp = () => String(crypto.randomInt(100000, 1000000));

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

// Accepts 04xx xxx xxx, +61 4xx xxx xxx, landlines (02/03/07/08) and 1300/1800 numbers
const isAuPhone = (v) => {
  if (!v) return true;
  const d = String(v).replace(/[\s()-]/g, '');
  return /^(\+?61|0)[2-478]\d{8}$/.test(d) || /^1[38]00\d{6}$/.test(d);
};

const strongPassword = (p) =>
  typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { asyncHandler, sha256, makeOtp, isEmail, isAuPhone, strongPassword, escapeRegex };
