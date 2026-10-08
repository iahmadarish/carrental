const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    state: { type: String, enum: [...AU_STATES, ''], default: '' },
    licenceNumber: { type: String, trim: true, default: '' },
    marketingOptIn: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },

    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },

    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    state: this.state,
    licenceNumber: this.licenceNumber,
    marketingOptIn: this.marketingOptIn,
    isVerified: this.isVerified,
    favourites: this.favourites,
    createdAt: this.createdAt,
  };
};

userSchema.statics.AU_STATES = AU_STATES;

module.exports = mongoose.model('User', userSchema);
