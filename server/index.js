// VeloDrive API — Express + MongoDB
// Runs on PORT (default 5000). Next.js proxies /api/* here (see next.config.mjs rewrites).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const Car = require('./models/Car');
const User = require('./models/User');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));
app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((err, _req, res, _next) => { // 4 args = Express error handler
  console.error('💥', err);
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id.' });
  res.status(err.status || 500).json({ message: 'Something went wrong on our side. Please try again.' });
});

async function bootstrap() {
  if (String(process.env.SEED_ON_START) === 'true' && (await Car.estimatedDocumentCount()) === 0) {
    const cars = require('./seed/cars.data');
    for (const c of cars) await Car.create(c);
    console.log(`🌱 Seeded ${cars.length} demo cars`);
  }
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await User.exists({ email: ADMIN_EMAIL.toLowerCase() }))) {
    await User.create({ name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin', isVerified: true });
    console.log(`🔑 Admin account created → ${ADMIN_EMAIL}`);
  }
}

const PORT = process.env.API_PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(bootstrap)
  .then(() => app.listen(PORT, () => console.log(`🚗 VeloDrive API → http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('❌ API could not start:', err.message);
    console.error('   Check MONGO_URI in .env and that your IP is allowed in MongoDB Atlas → Network Access.');
    process.exit(1);
  });
