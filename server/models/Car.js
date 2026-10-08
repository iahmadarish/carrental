const mongoose = require('mongoose');

const slugify = (s) =>
  s.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const carSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    make: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1990, max: 2100 },
    type: {
      type: String,
      enum: ['SUV', 'Sedan', 'Ute', 'Hatch', 'Electric', 'Luxury', 'Van', '4WD', 'Convertible'],
      required: true,
      index: true,
    },
    listing: { type: String, enum: ['rent', 'sale', 'both'], default: 'rent', index: true },

    pricePerDay: { type: Number, min: 0, default: 0 }, // AUD incl. GST
    salePrice: { type: Number, min: 0, default: 0 }, // AUD drive-away incl. GST
    odometer: { type: Number, default: 0 }, // km

    transmission: { type: String, enum: ['Automatic', 'Manual'], default: 'Automatic' },
    fuel: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'], default: 'Petrol' },
    seats: { type: Number, default: 5 },
    doors: { type: Number, default: 4 },
    engine: { type: String, default: '' },
    range: { type: String, default: '' }, // for EVs
    colour: { type: String, default: '' },
    ancap: { type: Number, min: 0, max: 5, default: 5 },
    fuelEconomy: { type: String, default: '' }, // L/100km

    city: { type: String, default: 'Sydney', index: true },
    state: { type: String, default: 'NSW' },

    images: [{ type: String }],
    features: [{ type: String }],
    description: { type: String, default: '' },

    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

carSchema.pre('validate', function makeSlug(next) {
  if (!this.slug && this.title) {
    this.slug = `${slugify(this.title)}-${this.year}-${Math.random().toString(36).slice(2, 6)}`;
  }
  next();
});

carSchema.index({ title: 'text', make: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
