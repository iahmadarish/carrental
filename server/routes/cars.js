const express = require('express');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');
const { asyncHandler, escapeRegex } = require('../utils/helpers');
const { quote, EXTRAS_PER_DAY } = require('../utils/pricing');

const router = express.Router();

// GET /api/cars?listing=rent&type=SUV&make=Toyota&city=Sydney&q=&min=&max=&fuel=&seats=&sort=price_asc&page=1&limit=12
router.get('/', asyncHandler(async (req, res) => {
  const { listing, type, make, city, q, min, max, fuel, seats, transmission, featured, sort, page = 1, limit = 12 } = req.query;
  const filter = { available: true };

  if (listing === 'rent') filter.listing = { $in: ['rent', 'both'] };
  if (listing === 'sale') filter.listing = { $in: ['sale', 'both'] };
  if (type) filter.type = { $in: String(type).split(',') };
  if (make) filter.make = { $in: String(make).split(',') };
  if (city) filter.city = city;
  if (fuel) filter.fuel = { $in: String(fuel).split(',') };
  if (transmission) filter.transmission = transmission;
  if (seats) filter.seats = { $gte: Number(seats) };
  if (featured === 'true') filter.featured = true;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { make: rx }, { model: rx }, { type: rx }];
  }

  const priceField = listing === 'sale' ? 'salePrice' : 'pricePerDay';
  if (min || max) {
    filter[priceField] = {};
    if (min) filter[priceField].$gte = Number(min);
    if (max) filter[priceField].$lte = Number(max);
  }

  const sorts = {
    price_asc: { [priceField]: 1 },
    price_desc: { [priceField]: -1 },
    newest: { year: -1, createdAt: -1 },
    rating: { rating: -1 },
  };

  const lim = Math.min(48, Math.max(1, Number(limit)));
  const skip = (Math.max(1, Number(page)) - 1) * lim;
  const [cars, total] = await Promise.all([
    Car.find(filter).sort(sorts[sort] || { featured: -1, createdAt: -1 }).skip(skip).limit(lim),
    Car.countDocuments(filter),
  ]);
  res.json({ cars, total, page: Number(page), pages: Math.ceil(total / lim) });
}));

// GET /api/cars/meta — values for filters
router.get('/meta', asyncHandler(async (_req, res) => {
  const [makes, cities, types, counts] = await Promise.all([
    Car.distinct('make', { available: true }),
    Car.distinct('city', { available: true }),
    Car.distinct('type', { available: true }),
    Car.aggregate([{ $match: { available: true } }, { $group: { _id: '$listing', n: { $sum: 1 } } }]),
  ]);
  res.json({ makes: makes.sort(), cities: cities.sort(), types: types.sort(), counts, extras: EXTRAS_PER_DAY });
}));

// GET /api/cars/:slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const car = await Car.findOne({ slug: req.params.slug });
  if (!car) return res.status(404).json({ message: 'Car not found.' });
  const similar = await Car.find({ _id: { $ne: car._id }, type: car.type, available: true }).limit(3);
  const booked = await Booking.find({
    car: car._id, kind: 'rental', status: { $in: ['pending', 'confirmed', 'active'] }, endDate: { $gte: new Date() },
  }).select('startDate endDate -_id');
  res.json({ car, similar, booked });
}));

// POST /api/cars/:id/quote
router.post('/:id/quote', asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: 'Car not found.' });
  res.json(quote(car, req.body));
}));

// ── Admin CRUD ──
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const car = await Car.create(req.body);
  res.status(201).json({ car });
}));

router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!car) return res.status(404).json({ message: 'Car not found.' });
  res.json({ car });
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: 'Car deleted.' });
}));

module.exports = router;
