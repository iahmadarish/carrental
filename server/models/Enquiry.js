const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['contact', 'finance', 'trade-in', 'purchase', 'corporate'],
      default: 'contact',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    state: { type: String, default: '' },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    message: { type: String, default: '', maxlength: 3000 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
