const express = require('express');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { protect, requireVerified } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');
const { quote } = require('../utils/pricing');
const { sendMail, templates } = require('../utils/mailer');

const router = express.Router();

// POST /api/bookings
router.post('/', protect, requireVerified, asyncHandler(async (req, res) => {
  const { carId, kind = 'rental', startDate, endDate, pickupLocation, dropoffLocation, extras = {}, notes } = req.body;
  const car = await Car.findById(carId);
  if (!car || !car.available) return res.status(404).json({ message: 'This vehicle is not available.' });

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return res.status(400).json({ message: 'Please choose a valid date.' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (start < today) return res.status(400).json({ message: 'Start date can’t be in the past.' });

  let data = { user: req.user._id, car: car._id, kind, startDate: start, pickupLocation, dropoffLocation, notes };

  if (kind === 'rental') {
    if (!['rent', 'both'].includes(car.listing)) return res.status(400).json({ message: 'This car is for sale only.' });
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ message: 'Return date must be after pick-up.' });

    const clash = await Booking.findOne({
      car: car._id, kind: 'rental', status: { $in: ['pending', 'confirmed', 'active'] },
      startDate: { $lt: end }, endDate: { $gt: start },
    });
    if (clash) return res.status(409).json({ message: 'Sorry, this car is already booked for those dates.' });

    const q = quote(car, { startDate: start, endDate: end, extras });
    data = { ...data, endDate: end, extras, days: q.days, subtotal: q.subtotal, extrasTotal: q.extrasTotal, total: q.total, gst: q.gst };
  } else {
    data.endDate = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour test-drive slot
  }

  const booking = await Booking.create(data);
  sendMail({ to: req.user.email, ...templates.booking(req.user.name.split(' ')[0], booking, car) }).catch(console.error);
  res.status(201).json({ message: 'Booking received! Check your email for details.', booking });
}));

// GET /api/bookings/mine
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('car', 'title slug images city').sort({ createdAt: -1 });
  res.json({ bookings });
}));

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ message: 'This booking can no longer be cancelled online.' });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ message: 'Booking cancelled.', booking });
}));

module.exports = router;
