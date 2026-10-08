const express = require('express');
const rateLimit = require('express-rate-limit');
const Enquiry = require('../models/Enquiry');
const Subscriber = require('../models/Subscriber');
const { asyncHandler, isEmail, isAuPhone } = require('../utils/helpers');
const { sendMail, templates } = require('../utils/mailer');

const router = express.Router();
const formLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, message: { message: 'Too many submissions, please slow down.' } });

// POST /api/enquiries
router.post('/enquiries', formLimiter, asyncHandler(async (req, res) => {
  const { kind = 'contact', name, email, phone, state, car, message, details, website } = req.body;
  if (website) return res.json({ message: 'Thanks!' }); // honeypot for bots
  if (!name || !isEmail(email)) return res.status(400).json({ message: 'Please add your name and a valid email.' });
  if (!isAuPhone(phone)) return res.status(400).json({ message: 'Please enter a valid Australian phone number.' });

  const enquiry = await Enquiry.create({ kind, name, email, phone, state, car: car || undefined, message, details });
  sendMail({ to: email, ...templates.enquiry(name.split(' ')[0], kind.replace('-', ' ')) }).catch(console.error);
  res.status(201).json({ message: 'Thanks! A specialist will contact you within one business day.', id: enquiry._id });
}));

// POST /api/newsletter
router.post('/newsletter', formLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email.' });
  await Subscriber.updateOne({ email: email.toLowerCase() }, { $setOnInsert: { email } }, { upsert: true });
  res.json({ message: 'You’re in! Watch your inbox for exclusive deals.' });
}));

module.exports = router;
