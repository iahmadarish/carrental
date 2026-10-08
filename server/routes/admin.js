const express = require('express');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Subscriber = require('../models/Subscriber');
const { protect, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', asyncHandler(async (_req, res) => {
  const [users, cars, bookings, enquiries, subscribers, revenueAgg, byStatus, recent] = await Promise.all([
    User.countDocuments(),
    Car.countDocuments(),
    Booking.countDocuments(),
    Enquiry.countDocuments({ status: 'new' }),
    Subscriber.countDocuments(),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Booking.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Booking.find().sort({ createdAt: -1 }).limit(5).populate('car', 'title').populate('user', 'name email'),
  ]);
  res.json({ users, cars, bookings, enquiries, subscribers, revenue: revenueAgg[0]?.total || 0, byStatus, recent });
}));

router.get('/bookings', asyncHandler(async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).limit(200)
    .populate('car', 'title slug').populate('user', 'name email phone');
  res.json({ bookings });
}));

router.patch('/bookings/:id', asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  res.json({ booking });
}));

router.get('/enquiries', asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(200).populate('car', 'title');
  res.json({ enquiries });
}));

router.patch('/enquiries/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  res.json({ enquiry });
}));

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  res.json({ users: users.map((u) => u.toSafeJSON()) });
}));

router.get('/cars', asyncHandler(async (_req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  res.json({ cars });
}));

module.exports = router;
