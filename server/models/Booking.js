const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    kind: { type: String, enum: ['rental', 'test-drive'], default: 'rental' },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pickupLocation: { type: String, default: '' },
    dropoffLocation: { type: String, default: '' },

    extras: {
      insurance: { type: String, enum: ['standard', 'premium', 'zero-excess'], default: 'standard' },
      childSeat: { type: Boolean, default: false },
      gps: { type: Boolean, default: false },
      etag: { type: Boolean, default: false },
      additionalDriver: { type: Boolean, default: false },
    },

    days: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    extrasTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 }, // AUD incl. GST
    gst: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function makeRef(next) {
  if (!this.reference) {
    this.reference = `AM-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36).slice(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
