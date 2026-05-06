require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const { requireAdmin } = require('./middleware/auth');
const { convertFromUSD, fetchRates } = require('./services/currency');
const { watermarkImage, saveOriginalCopy } = require('./services/imageProcessor');

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const forceSecureCookie = process.env.COOKIE_SECURE === '1';

const publicDir = path.join(process.cwd(), 'public');
const uploadRootDir = path.resolve(process.env.UPLOAD_ROOT_DIR || path.join(publicDir, 'uploads'));
const roomUploadDir = path.join(uploadRootDir, 'rooms');
const siteUploadDir = path.join(uploadRootDir, 'site');
const roomOriginalDir = path.join(uploadRootDir, 'originals', 'rooms');
const siteOriginalDir = path.join(uploadRootDir, 'originals', 'site');
const tempUploadDir = path.join(process.cwd(), 'tmp-uploads');
const uploadRootRelativeToPublic = path.relative(publicDir, uploadRootDir);
const uploadsInsidePublic =
  (uploadRootRelativeToPublic === '' ||
    (!uploadRootRelativeToPublic.startsWith('..') && !path.isAbsolute(uploadRootRelativeToPublic)));

fs.mkdirSync(roomUploadDir, { recursive: true });
fs.mkdirSync(siteUploadDir, { recursive: true });
fs.mkdirSync(roomOriginalDir, { recursive: true });
fs.mkdirSync(siteOriginalDir, { recursive: true });
fs.mkdirSync(tempUploadDir, { recursive: true });

if (isProduction || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' }
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again in a few minutes.' }
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait before trying again.' }
});

const upload = multer({
  dest: tempUploadDir,
  limits: {
    fileSize: 7 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed.'));
    }

    return callback(null, true);
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 12,
      sameSite: 'lax',
      secure: forceSecureCookie ? true : 'auto',
      httpOnly: true
    }
  })
);

app.use('/api', apiLimiter);
if (!uploadsInsidePublic) {
  app.use('/uploads', express.static(uploadRootDir));
}
app.use(express.static(publicDir));

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function bookingCode() {
  return `BOMA-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function normalizeRoom(room) {
  return {
    ...room,
    amenities: JSON.parse(room.amenities_json || '[]')
  };
}

function normalizeCurrency(code) {
  return String(code || 'USD')
    .trim()
    .toUpperCase();
}

function normalizePaymentOption(value) {
  const option = String(value || 'pay_on_arrival').trim().toLowerCase();
  if (option === 'pay_online') return 'pay_online';
  return 'pay_on_arrival';
}

function parseDateOnly(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ''))) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nightsBetween(checkIn, checkOut) {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (!start || !end) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function validateDateRange(checkIn, checkOut) {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (!start || !end) return { ok: false, error: 'Invalid date format. Use YYYY-MM-DD.' };

  const nights = nightsBetween(checkIn, checkOut);
  if (!nights || nights <= 0) return { ok: false, error: 'Check-out must be after check-in.' };

  return { ok: true, nights, start, end };
}

function isLikelyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function normalizeGuestPhone(value) {
  const raw = String(value || '').trim();
  const cleaned = raw
    .replace(/[^+\d]/g, '')
    .replace(/(?!^)\+/g, '');

  if (!cleaned) return '';
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

function isLikelyPhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(String(value || ''));
}

function removeFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
}

function uploadUrlToAbsolutePath(uploadUrl) {
  if (!uploadUrl || !uploadUrl.startsWith('/uploads/')) return '';
  const relativeUploadPath = uploadUrl.replace(/^\/uploads\/?/, '');
  return path.join(uploadRootDir, relativeUploadPath);
}

function removeUploadByUrl(uploadUrl) {
  const filePath = uploadUrlToAbsolutePath(uploadUrl);
  if (!filePath) return;
  removeFileIfExists(filePath);
}

function removeRelatedOriginalByProcessedUrl(processedUrl) {
  const absoluteProcessedPath = uploadUrlToAbsolutePath(processedUrl);
  if (!absoluteProcessedPath) return;
  const directory = path.dirname(absoluteProcessedPath);
  const extension = path.extname(absoluteProcessedPath);
  const baseName = path.basename(absoluteProcessedPath, extension);
  const folderType = directory.includes(`${path.sep}rooms`) ? 'rooms' : 'site';
  const originalsDir = folderType === 'rooms' ? roomOriginalDir : siteOriginalDir;

  if (!fs.existsSync(originalsDir)) return;

  const relatedOriginal = fs
    .readdirSync(originalsDir)
    .find((filename) => filename.startsWith(`${baseName}-orig.`));

  if (relatedOriginal) {
    removeFileIfExists(path.join(originalsDir, relatedOriginal));
  }
}

function getSettings() {
  return db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
}

function getRoomImages(roomId) {
  return db
    .prepare('SELECT id, image_url, caption, sort_order FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id DESC')
    .all(roomId);
}

function getPublicRooms() {
  const rooms = db.prepare('SELECT * FROM rooms WHERE active = 1 ORDER BY featured DESC, id ASC').all();
  return rooms.map((room) => {
    const normalized = normalizeRoom(room);
    return {
      ...normalized,
      images: getRoomImages(room.id)
    };
  });
}

function getAllRooms() {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY featured DESC, id ASC').all();
  return rooms.map((room) => {
    const normalized = normalizeRoom(room);
    return {
      ...normalized,
      images: getRoomImages(room.id)
    };
  });
}

function getPlatformLinks() {
  return db.prepare('SELECT * FROM platform_links ORDER BY sort_order ASC, id ASC').all();
}

function getHeroSlides() {
  return db.prepare('SELECT id, image_url, caption, sort_order FROM hero_slides ORDER BY sort_order ASC, id ASC').all();
}

function getConfirmedRanges(roomId) {
  return db
    .prepare(
      `SELECT check_in, check_out
       FROM bookings
       WHERE room_id = ?
         AND booking_status = 'confirmed'
       ORDER BY check_in ASC`
    )
    .all(roomId);
}

function isRoomAvailable(roomId, checkIn, checkOut, ignoreBookingId = null) {
  const overlap = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM bookings
       WHERE room_id = @roomId
         AND booking_status = 'confirmed'
         AND (@ignoreBookingId IS NULL OR id != @ignoreBookingId)
         AND NOT (check_out <= @checkIn OR check_in >= @checkOut)`
    )
    .get({ roomId, checkIn, checkOut, ignoreBookingId });

  return overlap.count === 0;
}

function adminSummary() {
  const pending = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'pending'").get().count;
  const confirmed = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'confirmed'").get().count;
  const revenue = db.prepare("SELECT COALESCE(SUM(total_usd), 0) AS total FROM bookings WHERE booking_status = 'confirmed'").get().total;

  return {
    pending,
    confirmed,
    revenueUsd: Number(Number(revenue).toFixed(2))
  };
}

function buildSitemapXml(baseUrl, rooms) {
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/admin`
  ];

  rooms.forEach((room) => {
    urls.push(`${baseUrl}/#room-${room.slug}`);
  });

  const body = urls
    .map((loc) => `<url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    service: 'bomagawani-room-rent',
    time: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
});

app.get('/sitemap.xml', (req, res) => {
  const settings = getSettings();
  const base = settings.domain.startsWith('http') ? settings.domain : `https://${settings.domain}`;
  const rooms = db.prepare('SELECT slug FROM rooms WHERE active = 1').all();

  res.type('application/xml').send(buildSitemapXml(base, rooms));
});

app.get('/api/public/bootstrap', async (req, res) => {
  try {
    const settings = getSettings();
    const rooms = getPublicRooms().map((room) => ({
      ...room,
      unavailable: getConfirmedRanges(room.id)
    }));

    const rates = await fetchRates('USD');

    res.json({
      settings,
      rooms,
      links: getPlatformLinks(),
      heroSlides: getHeroSlides(),
      currencies: Object.keys(rates).filter((c) => ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'].includes(c))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load public data.' });
  }
});

app.get('/api/public/quote', async (req, res) => {
  const roomId = Number(req.query.roomId);
  const checkIn = String(req.query.checkIn || '').trim();
  const checkOut = String(req.query.checkOut || '').trim();
  const currency = normalizeCurrency(req.query.currency);

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'roomId, checkIn, and checkOut are required.' });
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const dateCheck = validateDateRange(checkIn, checkOut);
  if (!dateCheck.ok) {
    return res.status(400).json({ error: dateCheck.error });
  }

  if (!isRoomAvailable(roomId, checkIn, checkOut)) {
    return res.status(409).json({ error: 'Selected dates are not available.' });
  }

  const totalUsd = Number((dateCheck.nights * room.price_per_night_usd).toFixed(2));
  const converted = await convertFromUSD(totalUsd, currency);

  return res.json({
    nights: dateCheck.nights,
    roomName: room.name,
    pricePerNightUsd: room.price_per_night_usd,
    totalUsd,
    currency: converted.currency,
    exchangeRate: converted.rate,
    totalInCurrency: converted.total
  });
});

app.post('/api/public/bookings', bookingLimiter, async (req, res) => {
  const roomId = Number(req.body.roomId);
  const guestName = String(req.body.guestName || '').trim();
  const guestEmail = String(req.body.guestEmail || '').trim();
  const guestPhone = normalizeGuestPhone(
    req.body.guestPhone || `${String(req.body.phoneCountryCode || '').trim()}${String(req.body.phoneLocal || '').trim()}`
  );
  const checkIn = String(req.body.checkIn || '').trim();
  const checkOut = String(req.body.checkOut || '').trim();
  const parsedGuests = Number(req.body.guestsCount || 1);
  const note = String(req.body.note || '').trim();
  const currencyCode = normalizeCurrency(req.body.currencyCode || 'USD');
  const paymentOption = normalizePaymentOption(req.body.paymentOption || 'pay_on_arrival');

  if (!roomId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !parsedGuests) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }

  if (!isLikelyEmail(guestEmail)) {
    return res.status(400).json({ error: 'Please enter a valid guest email.' });
  }

  if (guestName.length < 2 || !isLikelyPhone(guestPhone)) {
    return res.status(400).json({ error: 'Guest name or phone seems invalid.' });
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (parsedGuests > room.max_guests || parsedGuests < 1) {
    return res.status(400).json({ error: `Maximum guests for ${room.name} is ${room.max_guests}.` });
  }

  const dateCheck = validateDateRange(checkIn, checkOut);
  if (!dateCheck.ok) {
    return res.status(400).json({ error: dateCheck.error });
  }

  if (!isRoomAvailable(roomId, checkIn, checkOut)) {
    return res.status(409).json({ error: 'These dates are already booked. Please choose different dates.' });
  }

  const totalUsd = Number((dateCheck.nights * room.price_per_night_usd).toFixed(2));
  const converted = await convertFromUSD(totalUsd, currencyCode);
  const code = bookingCode();

  db.prepare(
    `INSERT INTO bookings (
      booking_code, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
      nights, guests_count, note, price_per_night_usd, total_usd, currency_code,
      exchange_rate, total_in_currency, payment_option, payment_status, booking_status
    ) VALUES (
      @booking_code, @room_id, @guest_name, @guest_email, @guest_phone, @check_in, @check_out,
      @nights, @guests_count, @note, @price_per_night_usd, @total_usd, @currency_code,
      @exchange_rate, @total_in_currency, @payment_option, 'pending', 'pending'
    )`
  ).run({
    booking_code: code,
    room_id: roomId,
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    check_in: checkIn,
    check_out: checkOut,
    nights: dateCheck.nights,
    guests_count: parsedGuests,
    note,
    price_per_night_usd: room.price_per_night_usd,
    total_usd: totalUsd,
    currency_code: converted.currency,
    exchange_rate: converted.rate,
    total_in_currency: converted.total,
    payment_option: paymentOption
  });

  return res.status(201).json({
    message: 'Booking request created successfully. Waiting for admin confirmation.',
    bookingCode: code,
    receiptUrl: `/receipt/${code}`
  });
});

app.get('/api/public/bookings/:code', (req, res) => {
  const booking = db
    .prepare(
      `SELECT b.*, r.name AS room_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.booking_code = ?`
    )
    .get(String(req.params.code || '').toUpperCase());

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  return res.json(booking);
});

app.get('/api/public/rooms/:roomId/unavailable', (req, res) => {
  const roomId = Number(req.params.roomId);
  if (!roomId) {
    return res.status(400).json({ error: 'Invalid room id.' });
  }

  return res.json({ ranges: getConfirmedRanges(roomId) });
});

app.get('/api/public/exchange', async (req, res) => {
  try {
    const target = normalizeCurrency(req.query.currency || 'USD');
    const converted = await convertFromUSD(1, target);
    return res.json({ currency: target, usdRate: converted.rate });
  } catch (error) {
    return res.status(500).json({ error: 'Could not load exchange rates.' });
  }
});

app.get('/receipt/:code', (req, res) => {
  const booking = db
    .prepare(
      `SELECT b.*, r.name AS room_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.booking_code = ?`
    )
    .get(String(req.params.code || '').toUpperCase());

  if (!booking) {
    return res.status(404).send('Receipt not found.');
  }

  const settings = getSettings();

  const statusColor = booking.booking_status === 'confirmed' ? '#177245' : booking.booking_status === 'cancelled' ? '#8d1f31' : '#815a19';

  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt ${booking.booking_code}</title>
        <style>
          body { font-family: Arial, sans-serif; background:#f4f6f9; margin:0; padding:24px; color:#1d2430; }
          .receipt { max-width:760px; margin:auto; background:#fff; border-radius:14px; padding:28px; box-shadow:0 18px 45px rgba(0,0,0,0.08); }
          .top { display:flex; justify-content:space-between; align-items:flex-start; }
          h1 { margin:0; font-size:24px; }
          .badge { background:${statusColor}; color:white; border-radius:999px; padding:7px 12px; font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 24px; margin-top:24px; }
          .label { color:#6a7280; font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
          .value { margin-top:4px; font-size:15px; font-weight:600; }
          .amount { margin-top:24px; border-top:1px solid #e4e7ec; padding-top:16px; font-size:20px; font-weight:700; }
          .footer { margin-top:24px; color:#4e5969; font-size:13px; }
          @media print { body { background:white; padding:0; } .receipt { box-shadow:none; border-radius:0; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="top">
            <div>
              <h1>${settings.logo_text} - Booking Receipt</h1>
              <div>${settings.site_name}</div>
            </div>
            <span class="badge">${booking.booking_status}</span>
          </div>

          <div class="grid">
            <div><div class="label">Booking Code</div><div class="value">${booking.booking_code}</div></div>
            <div><div class="label">Guest</div><div class="value">${booking.guest_name}</div></div>
            <div><div class="label">Room</div><div class="value">${booking.room_name}</div></div>
            <div><div class="label">Dates</div><div class="value">${booking.check_in} to ${booking.check_out}</div></div>
            <div><div class="label">Nights</div><div class="value">${booking.nights}</div></div>
            <div><div class="label">Guests</div><div class="value">${booking.guests_count}</div></div>
            <div><div class="label">Contact</div><div class="value">${booking.guest_email}<br/>${booking.guest_phone}</div></div>
            <div><div class="label">Payment Option</div><div class="value">${booking.payment_option === 'pay_online' ? 'Pay Online' : 'Pay On Arrival'}</div></div>
            <div><div class="label">Payment Status</div><div class="value">${booking.payment_status}</div></div>
          </div>

          <div class="amount">Total: ${booking.total_in_currency} ${booking.currency_code}</div>
          <div class="footer">Generated on ${new Date().toISOString().slice(0, 10)} | Domain: ${settings.domain}</div>
        </div>
      </body>
    </html>
  `);
});

app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.prepare('SELECT id, email, full_name, password_hash FROM admins WHERE lower(email) = lower(?)').get(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  req.session.adminId = admin.id;
  req.session.adminName = admin.full_name;

  return res.json({ id: admin.id, fullName: admin.full_name, email: admin.email });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/admin/session', (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, fullName: req.session.adminName });
});

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  res.json({
    summary: adminSummary(),
    settings: getSettings(),
    rooms: getAllRooms(),
    links: getPlatformLinks(),
    heroSlides: getHeroSlides()
  });
});

app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  const bookings = db
    .prepare(
      `SELECT b.*, r.name AS room_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       ORDER BY b.created_at DESC`
    )
    .all();

  return res.json({ bookings });
});

app.patch('/api/admin/bookings/:id/status', requireAdmin, (req, res) => {
  const bookingId = Number(req.params.id);
  const bookingStatus = req.body.bookingStatus;
  const paymentStatus = req.body.paymentStatus;

  const allowedBookingStatuses = ['pending', 'confirmed', 'cancelled'];
  const allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  if (bookingStatus && !allowedBookingStatuses.includes(bookingStatus)) {
    return res.status(400).json({ error: 'Invalid booking status.' });
  }

  if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Invalid payment status.' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (bookingStatus === 'confirmed') {
    const free = isRoomAvailable(booking.room_id, booking.check_in, booking.check_out, bookingId);
    if (!free) {
      return res.status(409).json({ error: 'Cannot confirm. The room has overlapping confirmed dates.' });
    }
  }

  db.prepare(
    `UPDATE bookings
     SET booking_status = COALESCE(@booking_status, booking_status),
         payment_status = COALESCE(@payment_status, payment_status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`
  ).run({
    id: bookingId,
    booking_status: bookingStatus || null,
    payment_status: paymentStatus || null
  });

  return res.json({ ok: true });
});

app.post('/api/admin/rooms', requireAdmin, (req, res) => {
  const name = String(req.body.name || '').trim();
  const shortDescription = String(req.body.shortDescription || '').trim();
  const longDescription = String(req.body.longDescription || '').trim();
  const pricePerNightUsd = Number(req.body.pricePerNightUsd);
  const maxGuests = Number(req.body.maxGuests);
  const sizeLabel = String(req.body.sizeLabel || '').trim();
  const featured = req.body.featured === true;
  const active = req.body.active !== false;
  const amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [];

  if (!name || !shortDescription || !longDescription || !pricePerNightUsd || !maxGuests || !sizeLabel) {
    return res.status(400).json({ error: 'Please fill all required room fields.' });
  }

  if (pricePerNightUsd <= 0 || maxGuests < 1) {
    return res.status(400).json({ error: 'Price and max guests must be valid positive values.' });
  }

  const slugBase = slugify(name);
  let slug = slugBase;
  let i = 1;

  while (db.prepare('SELECT id FROM rooms WHERE slug = ?').get(slug)) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }

  const result = db
    .prepare(
      `INSERT INTO rooms (
        name, slug, short_description, long_description, price_per_night_usd,
        max_guests, size_label, featured, active, amenities_json
      ) VALUES (
        @name, @slug, @short_description, @long_description, @price_per_night_usd,
        @max_guests, @size_label, @featured, @active, @amenities_json
      )`
    )
    .run({
      name,
      slug,
      short_description: shortDescription,
      long_description: longDescription,
      price_per_night_usd: pricePerNightUsd,
      max_guests: maxGuests,
      size_label: sizeLabel,
      featured: featured ? 1 : 0,
      active: active ? 1 : 0,
      amenities_json: JSON.stringify(amenities)
    });

  return res.status(201).json({ id: result.lastInsertRowid, slug });
});

app.put('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const name = String(req.body.name || room.name).trim();
  const shortDescription = String(req.body.shortDescription || room.short_description).trim();
  const longDescription = String(req.body.longDescription || room.long_description).trim();
  const parsedPrice = req.body.pricePerNightUsd !== undefined ? Number(req.body.pricePerNightUsd) : Number(room.price_per_night_usd);
  const parsedMaxGuests = req.body.maxGuests !== undefined ? Number(req.body.maxGuests) : Number(room.max_guests);
  const sizeLabel = String(req.body.sizeLabel || room.size_label).trim();
  const featured = typeof req.body.featured === 'boolean' ? (req.body.featured ? 1 : 0) : room.featured;
  const active = typeof req.body.active === 'boolean' ? (req.body.active ? 1 : 0) : room.active;
  const amenities = Array.isArray(req.body.amenities) ? req.body.amenities : JSON.parse(room.amenities_json || '[]');
  const coverImage = req.body.coverImage === undefined ? room.cover_image || '' : String(req.body.coverImage || '').trim();

  if (parsedPrice <= 0 || parsedMaxGuests < 1) {
    return res.status(400).json({ error: 'Price and max guests must be valid positive values.' });
  }

  db.prepare(
    `UPDATE rooms
     SET name = @name,
         short_description = @short_description,
         long_description = @long_description,
         price_per_night_usd = @price_per_night_usd,
         max_guests = @max_guests,
         size_label = @size_label,
         featured = @featured,
         active = @active,
         amenities_json = @amenities_json,
         cover_image = @cover_image,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`
  ).run({
    id: roomId,
    name,
    short_description: shortDescription,
    long_description: longDescription,
    price_per_night_usd: parsedPrice,
    max_guests: parsedMaxGuests,
    size_label: sizeLabel,
    featured,
    active,
    amenities_json: JSON.stringify(amenities),
    cover_image: coverImage
  });

  return res.json({ ok: true });
});

app.put('/api/admin/rooms/:roomId/cover', requireAdmin, (req, res) => {
  const roomId = Number(req.params.roomId);
  const imageId = Number(req.body.imageId);

  if (!roomId || !imageId) {
    return res.status(400).json({ error: 'roomId and imageId are required.' });
  }

  const image = db.prepare('SELECT * FROM room_images WHERE id = ? AND room_id = ?').get(imageId, roomId);
  if (!image) {
    return res.status(404).json({ error: 'Image not found in this room.' });
  }

  db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(image.image_url, roomId);

  return res.json({ ok: true, coverImage: image.image_url });
});

app.delete('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const roomId = Number(req.params.id);

  const hasBookings = db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE room_id = ?').get(roomId).count;
  if (hasBookings > 0) {
    return res.status(400).json({ error: 'Room has bookings. Set it as inactive instead of deleting.' });
  }

  const images = db.prepare('SELECT image_url FROM room_images WHERE room_id = ?').all(roomId);
  images.forEach((row) => {
    removeUploadByUrl(row.image_url);
    removeRelatedOriginalByProcessedUrl(row.image_url);
  });

  db.prepare('DELETE FROM room_images WHERE room_id = ?').run(roomId);
  db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);

  return res.json({ ok: true });
});

app.post('/api/admin/rooms/:id/images', requireAdmin, upload.single('image'), async (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    removeFileIfExists(req.file?.path);
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const settings = getSettings();
    const baseName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const outputFilename = `${baseName}.jpg`;
    const sourceExtension = (path.extname(req.file.originalname || '') || '.jpg').toLowerCase();
    const safeExtension = /^[.][a-z0-9]{2,6}$/.test(sourceExtension) ? sourceExtension : '.jpg';
    const outputPath = path.join(roomUploadDir, outputFilename);
    const originalCopyPath = path.join(roomOriginalDir, `${baseName}-orig${safeExtension}`);

    await saveOriginalCopy(req.file.path, originalCopyPath);
    await watermarkImage(req.file.path, outputPath, settings.logo_text, 'room');

    const imageUrl = `/uploads/rooms/${outputFilename}`;

    const result = db
      .prepare(
        `INSERT INTO room_images (room_id, image_url, caption, sort_order)
         VALUES (?, ?, ?, ?)`
      )
      .run(roomId, imageUrl, String(req.body.caption || '').trim(), Number(req.body.sortOrder || 0));

    if (!room.cover_image) {
      db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(imageUrl, roomId);
    }

    removeFileIfExists(req.file.path);

    return res.status(201).json({ id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    removeFileIfExists(req.file?.path);
    return res.status(500).json({ error: 'Image upload failed.' });
  }
});

app.delete('/api/admin/images/:id', requireAdmin, (req, res) => {
  const imageId = Number(req.params.id);
  const image = db.prepare('SELECT * FROM room_images WHERE id = ?').get(imageId);
  if (!image) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  db.prepare('DELETE FROM room_images WHERE id = ?').run(imageId);
  removeUploadByUrl(image.image_url);
  removeRelatedOriginalByProcessedUrl(image.image_url);

  const room = db.prepare('SELECT id, cover_image FROM rooms WHERE id = ?').get(image.room_id);
  if (room && room.cover_image === image.image_url) {
    const fallback = db.prepare('SELECT image_url FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id DESC LIMIT 1').get(image.room_id);
    db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fallback?.image_url || '', image.room_id);
  }

  return res.json({ ok: true });
});

app.post('/api/admin/settings/hero-image', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const settings = getSettings();
    const baseName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const outputFilename = `${baseName}.jpg`;
    const sourceExtension = (path.extname(req.file.originalname || '') || '.jpg').toLowerCase();
    const safeExtension = /^[.][a-z0-9]{2,6}$/.test(sourceExtension) ? sourceExtension : '.jpg';
    const outputPath = path.join(siteUploadDir, outputFilename);
    const originalCopyPath = path.join(siteOriginalDir, `${baseName}-orig${safeExtension}`);

    await saveOriginalCopy(req.file.path, originalCopyPath);
    await watermarkImage(req.file.path, outputPath, settings.logo_text, 'hero');

    const imageUrl = `/uploads/site/${outputFilename}`;
    db.prepare('UPDATE site_settings SET hero_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(imageUrl);

    removeFileIfExists(req.file.path);
    removeUploadByUrl(settings.hero_image);
    removeRelatedOriginalByProcessedUrl(settings.hero_image);

    return res.json({ imageUrl });
  } catch (error) {
    removeFileIfExists(req.file?.path);
    return res.status(500).json({ error: 'Hero image upload failed.' });
  }
});

app.post('/api/admin/hero-slides', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const settings = getSettings();
    const baseName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const outputFilename = `${baseName}.jpg`;
    const sourceExtension = (path.extname(req.file.originalname || '') || '.jpg').toLowerCase();
    const safeExtension = /^[.][a-z0-9]{2,6}$/.test(sourceExtension) ? sourceExtension : '.jpg';
    const outputPath = path.join(siteUploadDir, outputFilename);
    const originalCopyPath = path.join(siteOriginalDir, `${baseName}-orig${safeExtension}`);

    await saveOriginalCopy(req.file.path, originalCopyPath);
    await watermarkImage(req.file.path, outputPath, settings.logo_text, 'slide');

    const imageUrl = `/uploads/site/${outputFilename}`;
    const sortOrder = Number(req.body.sortOrder || Date.now());
    const caption = String(req.body.caption || '').trim();

    const result = db
      .prepare('INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (?, ?, ?)')
      .run(imageUrl, caption, sortOrder);

    removeFileIfExists(req.file.path);
    return res.status(201).json({ id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    removeFileIfExists(req.file?.path);
    return res.status(500).json({ error: 'Hero slide upload failed.' });
  }
});

app.put('/api/admin/hero-slides/order', requireAdmin, (req, res) => {
  const slideIds = Array.isArray(req.body.slideIds) ? req.body.slideIds.map((id) => Number(id)).filter(Boolean) : [];
  if (!slideIds.length) {
    return res.status(400).json({ error: 'slideIds is required.' });
  }

  const updateSort = db.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?');
  const trx = db.transaction(() => {
    slideIds.forEach((id, index) => {
      updateSort.run(index + 1, id);
    });
  });

  trx();
  return res.json({ ok: true });
});

app.delete('/api/admin/hero-slides/:id', requireAdmin, (req, res) => {
  const slideId = Number(req.params.id);
  const slide = db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(slideId);
  if (!slide) {
    return res.status(404).json({ error: 'Hero slide not found.' });
  }

  db.prepare('DELETE FROM hero_slides WHERE id = ?').run(slideId);

  const usedByRoom = db.prepare('SELECT COUNT(*) AS count FROM room_images WHERE image_url = ?').get(slide.image_url).count > 0;
  const usedByCover = db.prepare('SELECT COUNT(*) AS count FROM rooms WHERE cover_image = ?').get(slide.image_url).count > 0;
  const usedBySettings = db.prepare('SELECT hero_image FROM site_settings WHERE id = 1').get().hero_image === slide.image_url;
  const usedByOtherSlides = db.prepare('SELECT COUNT(*) AS count FROM hero_slides WHERE image_url = ?').get(slide.image_url).count > 0;

  if (!usedByRoom && !usedByCover && !usedBySettings && !usedByOtherSlides) {
    removeUploadByUrl(slide.image_url);
    removeRelatedOriginalByProcessedUrl(slide.image_url);
  }

  return res.json({ ok: true });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const siteName = String(req.body.siteName || '').trim();
  const domain = String(req.body.domain || '').trim();
  const headline = String(req.body.headline || '').trim();
  const subheadline = String(req.body.subheadline || '').trim();
  const aboutText = String(req.body.aboutText || '').trim();
  const address = String(req.body.address || '').trim();
  const mapLink = String(req.body.mapLink || '').trim();
  const contactPhone = String(req.body.contactPhone || '').trim();
  const contactEmail = String(req.body.contactEmail || '').trim();
  const checkInTime = String(req.body.checkInTime || '').trim();
  const checkOutTime = String(req.body.checkOutTime || '').trim();
  const baseCurrency = normalizeCurrency(req.body.baseCurrency || 'USD');
  const logoText = String(req.body.logoText || '').trim();

  if (!siteName || !domain || !headline || !aboutText || !address || !contactPhone || !contactEmail || !logoText) {
    return res.status(400).json({ error: 'Please complete all required site settings.' });
  }

  if (!isLikelyEmail(contactEmail)) {
    return res.status(400).json({ error: 'Please provide a valid contact email.' });
  }

  db.prepare(
    `UPDATE site_settings
     SET site_name = @site_name,
         domain = @domain,
         headline = @headline,
         subheadline = @subheadline,
         about_text = @about_text,
         address = @address,
         map_link = @map_link,
         contact_phone = @contact_phone,
         contact_email = @contact_email,
         check_in_time = @check_in_time,
         check_out_time = @check_out_time,
         base_currency = @base_currency,
         logo_text = @logo_text,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run({
    site_name: siteName,
    domain,
    headline,
    subheadline,
    about_text: aboutText,
    address,
    map_link: mapLink,
    contact_phone: contactPhone,
    contact_email: contactEmail,
    check_in_time: checkInTime,
    check_out_time: checkOutTime,
    base_currency: baseCurrency,
    logo_text: logoText
  });

  return res.json({ ok: true });
});

app.put('/api/admin/platform-links', requireAdmin, (req, res) => {
  const links = Array.isArray(req.body.links) ? req.body.links : [];

  const trx = db.transaction(() => {
    db.prepare('DELETE FROM platform_links').run();

    const insert = db.prepare('INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (?, ?, ?, ?)');
    links.forEach((link, index) => {
      const platformName = String(link.platformName || '').trim();
      const url = String(link.url || '').trim();
      const icon = String(link.icon || 'link').trim();
      if (platformName && /^https?:\/\//.test(url)) {
        insert.run(platformName, url, icon, Number(link.sortOrder ?? index + 1));
      }
    });
  });

  trx();
  return res.json({ ok: true });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((error, req, res, next) => {
  if (req.file?.path) {
    removeFileIfExists(req.file.path);
  }

  if (error?.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`Bomagawani app running on http://localhost:${port}`);
});
