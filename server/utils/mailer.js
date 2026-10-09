const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    // 465 = TLS from the start; 587/25 = plain connection upgraded with STARTTLS.
    // Derived from the port so a mismatched SMTP_SECURE can't cause "wrong version number".
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

const brand = {
  name: 'VeloDrive',
  accent: '#E8642C',
  dark: '#0B0B0D',
};

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f4efe8;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
      <tr><td style="background:${brand.dark};padding:28px 32px">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.5px">VELO<span style="color:${brand.accent}">●</span>DRIVE</span>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:22px">${title}</h1>
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:20px 32px;background:#faf7f2;font-size:12px;color:#777">
        VeloDrive Australia Pty Ltd · ABN 00 000 000 000 · 1300 835 637<br/>
        You’re receiving this because of activity on your account. All prices in AUD incl. GST.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log('\n📧 [EMAIL — SMTP not configured, printing instead]');
    console.log(`   To: ${to}\n   Subject: ${subject}\n   ${text || ''}\n`);
    return { simulated: true };
  }
  return t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html, text });
}

const templates = {
  otp: (name, code) => ({
    subject: `${code} is your VeloDrive verification code`,
    text: `G'day ${name}, your verification code is ${code}. It expires in 10 minutes.`,
    html: layout(`G'day ${name} 👋`, `
      <p>Use this code to verify your email address. It expires in <b>10 minutes</b>.</p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:800;background:#f4efe8;border-radius:12px;padding:18px;text-align:center;margin:20px 0">${code}</div>
      <p style="color:#777;font-size:13px">Didn’t create an account? You can safely ignore this email.</p>`),
  }),

  reset: (name, link) => ({
    subject: 'Reset your VeloDrive password',
    text: `Hi ${name}, reset your password here (valid 30 minutes): ${link}`,
    html: layout('Reset your password', `
      <p>Hi ${name}, we received a request to reset your password. This link is valid for <b>30 minutes</b>.</p>
      <p style="margin:28px 0"><a href="${link}" style="background:${brand.accent};color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:700">Reset password</a></p>
      <p style="color:#777;font-size:13px">If you didn’t ask for this, no action is needed.</p>`),
  }),

  welcome: (name) => ({
    subject: 'Welcome to VeloDrive 🚗',
    text: `Welcome aboard, ${name}! Your account is verified.`,
    html: layout(`Welcome aboard, ${name}!`, `
      <p>Your email is verified. You can now book rentals, save favourites and request test drives across Sydney, Melbourne, Brisbane, Perth, Adelaide and more.</p>
      <p style="margin:28px 0"><a href="${process.env.CLIENT_URL}/au/fleet" style="background:${brand.accent};color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:700">Explore the fleet</a></p>`),
  }),

  booking: (name, b, car) => ({
    subject: `Booking received · ${b.reference}`,
    text: `Hi ${name}, we've received your ${b.kind} booking ${b.reference} for ${car.title}.`,
    html: layout('Booking received ✅', `
      <p>Hi ${name}, thanks for choosing VeloDrive. Our team will confirm shortly.</p>
      <table width="100%" style="border-collapse:collapse;font-size:14px;margin:18px 0">
        <tr><td style="padding:8px 0;color:#777">Reference</td><td align="right"><b>${b.reference}</b></td></tr>
        <tr><td style="padding:8px 0;color:#777">Vehicle</td><td align="right">${car.title}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Type</td><td align="right">${b.kind === 'rental' ? 'Rental' : 'Test drive'}</td></tr>
        <tr><td style="padding:8px 0;color:#777">From</td><td align="right">${new Date(b.startDate).toLocaleDateString('en-AU')}</td></tr>
        ${b.kind === 'rental' ? `<tr><td style="padding:8px 0;color:#777">To</td><td align="right">${new Date(b.endDate).toLocaleDateString('en-AU')}</td></tr>
        <tr><td style="padding:8px 0;color:#777">Total (incl. GST)</td><td align="right"><b>A$${b.total.toFixed(2)}</b></td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#777">Pick-up</td><td align="right">${b.pickupLocation || car.city}</td></tr>
      </table>`),
  }),

  enquiry: (name, kind) => ({
    subject: 'We’ve got your enquiry',
    text: `Thanks ${name}, a specialist will contact you within one business day.`,
    html: layout(`Thanks, ${name}`, `<p>Your <b>${kind}</b> enquiry has landed with our team. A specialist will be in touch within one business day (AEST).</p>`),
  }),
};

module.exports = { sendMail, templates };
