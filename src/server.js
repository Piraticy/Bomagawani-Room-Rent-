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

const { db, ready } = require('./db');
const { requireAdmin } = require('./middleware/auth');
const { convertFromUSD, fetchRates } = require('./services/currency');
const { watermarkImage, saveOriginalCopy } = require('./services/imageProcessor');
const { sendBookingStatusEmail, sendNewBookingNotification } = require('./services/email');
const TursoSessionStore = require('./middleware/tursoSessionStore');
const blobStorage = require('./services/blobStorage');

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;
const forceSecureCookie = process.env.COOKIE_SECURE === '1';
const parsedUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB);
const maxUploadSizeMb = Math.max(1, Number.isFinite(parsedUploadSizeMb) ? parsedUploadSizeMb : 25);
const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;

const publicDir = path.join(process.cwd(), 'public');
const uploadRootDir = path.resolve(process.env.UPLOAD_ROOT_DIR || path.join(publicDir, 'uploads'));
const roomUploadDir = path.join(uploadRootDir, 'rooms');
const siteUploadDir = path.join(uploadRootDir, 'site');
const roomOriginalDir = path.join(uploadRootDir, 'originals', 'rooms');
const siteOriginalDir = path.join(uploadRootDir, 'originals', 'site');

// Local disk directories are only needed when Blob storage isn't configured -
// Vercel's filesystem outside /tmp isn't writable/persistent anyway, so this
// only matters for local dev, Docker, and Render. Skip unconditionally on
// Vercel even if BLOB_READ_WRITE_TOKEN isn't set yet, since mkdirSync would
// otherwise crash the whole function before it can serve any request.
if (!blobStorage.isEnabled && !isVercel) {
  fs.mkdirSync(roomUploadDir, { recursive: true });
  fs.mkdirSync(siteUploadDir, { recursive: true });
  fs.mkdirSync(roomOriginalDir, { recursive: true });
  fs.mkdirSync(siteOriginalDir, { recursive: true });
}

if (isProduction || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://unpkg.com'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://*.public.blob.vercel-storage.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'self'", 'https://www.google.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
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
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxUploadSizeBytes
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed.'));
    }

    return callback(null, true);
  }
});

// Watermarks an uploaded image buffer, saves it (Blob or local disk depending
// on blobStorage.isEnabled), and returns the URL to store in the DB. Also
// best-effort saves an unwatermarked backup copy when using local disk only -
// Blob storage has no private/hidden access tier, so we skip the original
// there rather than publish an un-watermarked copy at a guessable URL.
async function processAndSaveUpload({ buffer, originalname, relativeFolder, originalsDir, logoText, mode }) {
  const baseName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const outputFilename = `${baseName}.jpg`;

  const { buffer: watermarkedBuffer } = await watermarkImage(buffer, logoText, mode);
  const imageUrl = await blobStorage.saveUpload(watermarkedBuffer, `${relativeFolder}/${outputFilename}`, uploadRootDir);

  if (!blobStorage.isEnabled && originalsDir) {
    try {
      const sourceExtension = (path.extname(originalname || '') || '.jpg').toLowerCase();
      const safeExtension = /^[.][a-z0-9]{2,6}$/.test(sourceExtension) ? sourceExtension : '.jpg';
      const originalBuffer = await saveOriginalCopy(buffer);
      fs.mkdirSync(originalsDir, { recursive: true });
      fs.writeFileSync(path.join(originalsDir, `${baseName}-orig${safeExtension}`), originalBuffer);
    } catch (error) {
      console.error('[upload] Failed to save original backup copy (non-fatal):', error.message);
    }
  }

  return imageUrl;
}

const knownPlaceholderSecrets = new Set(['replace-with-long-random-secret', 'change-this-session-secret']);
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || knownPlaceholderSecrets.has(sessionSecret)) {
  if (isProduction) {
    throw new Error('SESSION_SECRET must be set to a unique random value before running in production.');
  }
  console.warn('Warning: SESSION_SECRET is missing or using a known placeholder value. Set a unique random value before deploying.');
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new TursoSessionStore(db),
    secret: sessionSecret || 'change-this-session-secret',
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

// Every request waits for the database (schema + seed data) to finish
// initializing before touching any route. On a warm serverless instance
// `ready` is already resolved, so this is a no-op after the first request.
app.use((req, res, next) => {
  ready.then(() => next()).catch(next);
});

const uploadsStaticOptions = { maxAge: '30d', immutable: true };
const publicStaticOptions = { maxAge: '10m' };

app.use('/api', apiLimiter);
app.use('/uploads/originals', (req, res) => res.status(404).end());
app.use('/uploads', express.static(uploadRootDir, uploadsStaticOptions));
app.use(express.static(publicDir, publicStaticOptions));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

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

function normalizeContentPage(page) {
  return {
    ...page,
    imageUrl: page.image_url || '',
    highlights: JSON.parse(page.highlights_json || '[]')
  };
}

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'];

function normalizeCurrency(code) {
  const value = String(code || 'USD').trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(value) ? value : 'USD';
}

function normalizePaymentOption(value) {
  const option = String(value || 'pay_on_arrival').trim().toLowerCase();
  if (option === 'pay_online') return 'pay_online';
  if (option === 'bank_transfer') return 'bank_transfer';
  return 'pay_on_arrival';
}

function paymentOptionLabel(option) {
  if (option === 'pay_online') return 'Pay Online';
  if (option === 'bank_transfer') return 'Bank Transfer (30% deposit)';
  return 'Pay On Arrival';
}

function parseDateOnly(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString || ''));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return date;
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
  const resolvedPath = path.resolve(uploadRootDir, relativeUploadPath);
  const relativeToRoot = path.relative(uploadRootDir, resolvedPath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return '';
  return resolvedPath;
}

async function removeUploadByUrl(uploadUrl) {
  await blobStorage.deleteUpload(uploadUrl, (url) => {
    const filePath = uploadUrlToAbsolutePath(url);
    if (filePath) removeFileIfExists(filePath);
  });
}

function removeRelatedOriginalByProcessedUrl(processedUrl) {
  if (blobStorage.isEnabled) return; // Originals are only ever saved to local disk.
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

async function getSettings() {
  return db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
}

async function getRoomImages(roomId) {
  return db
    .prepare('SELECT id, image_url, caption, sort_order FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id DESC')
    .all(roomId);
}

async function getPublicRooms() {
  const rooms = await db.prepare('SELECT * FROM rooms WHERE active = 1 ORDER BY featured DESC, id ASC').all();
  return Promise.all(
    rooms.map(async (room) => {
      const normalized = normalizeRoom(room);
      return {
        ...normalized,
        images: await getRoomImages(room.id)
      };
    })
  );
}

async function getAllRooms() {
  const rooms = await db.prepare('SELECT * FROM rooms ORDER BY featured DESC, id ASC').all();
  return Promise.all(
    rooms.map(async (room) => {
      const normalized = normalizeRoom(room);
      return {
        ...normalized,
        images: await getRoomImages(room.id)
      };
    })
  );
}

async function getPlatformLinks() {
  return db.prepare('SELECT * FROM platform_links ORDER BY sort_order ASC, id ASC').all();
}

async function getContentPages({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE active = 1' : '';
  const pages = await db.prepare(`SELECT * FROM content_pages ${where} ORDER BY sort_order ASC, id ASC`).all();
  return pages.map(normalizeContentPage);
}

async function getHeroSlides() {
  return db.prepare('SELECT id, image_url, caption, sort_order FROM hero_slides ORDER BY sort_order ASC, id ASC').all();
}

async function getChatbotSettings() {
  return db.prepare('SELECT id, title, greeting, whatsapp_number, whatsapp_message, enabled FROM chatbot_settings WHERE id = 1').get();
}

async function getChatbotFaqs() {
  return db.prepare('SELECT id, question, answer, sort_order FROM chatbot_faqs ORDER BY sort_order ASC, id ASC').all();
}

async function getConfirmedRanges(roomId) {
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

async function isRoomAvailable(roomId, checkIn, checkOut, ignoreBookingId = null) {
  const overlap = await db
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

async function adminSummary() {
  const pending = (await db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'pending'").get()).count;
  const confirmed = (await db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'confirmed'").get()).count;
  const revenue = (await db.prepare("SELECT COALESCE(SUM(total_usd), 0) AS total FROM bookings WHERE booking_status = 'confirmed'").get()).total;

  return {
    pending,
    confirmed,
    revenueUsd: Number(Number(revenue).toFixed(2))
  };
}

function normalizeSitemapDomain(domain) {
  const lower = domain.toLowerCase().replace(/^www\./, '');
  return `www.${lower}`;
}

function buildSitemapXml(baseUrl, rooms) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [`${baseUrl}/`, `${baseUrl}/rooms`, `${baseUrl}/eat-sip`, `${baseUrl}/bomagawani`, `${baseUrl}/offers-prices`, `${baseUrl}/contact`];

  rooms.forEach((room) => {
    urls.push(`${baseUrl}/#room-${room.slug}`);
  });

  const body = urls
    .map((loc) => `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`)
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

app.get('/sitemap.xml', async (req, res) => {
  const settings = await getSettings();
  const base = settings.domain.startsWith('http')
    ? settings.domain
    : `https://${normalizeSitemapDomain(settings.domain)}`;
  const rooms = await db.prepare('SELECT slug FROM rooms WHERE active = 1').all();

  res.type('application/xml').send(buildSitemapXml(base, rooms));
});

app.get('/api/public/bootstrap', async (req, res) => {
  try {
    const settings = await getSettings();
    const publicRooms = await getPublicRooms();
    const rooms = await Promise.all(
      publicRooms.map(async (room) => ({
        ...room,
        unavailable: await getConfirmedRanges(room.id)
      }))
    );

    const rates = await fetchRates('USD');

    res.json({
      settings,
      rooms,
      links: await getPlatformLinks(),
      contentPages: await getContentPages(),
      heroSlides: await getHeroSlides(),
      chatbot: await getChatbotSettings(),
      chatbotFaqs: await getChatbotFaqs(),
      currencies: Object.keys(rates).filter((c) => ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'].includes(c))
    });
  } catch (error) {
    console.error(error);
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

  const room = await db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const dateCheck = validateDateRange(checkIn, checkOut);
  if (!dateCheck.ok) {
    return res.status(400).json({ error: dateCheck.error });
  }

  if (!(await isRoomAvailable(roomId, checkIn, checkOut))) {
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

  const room = await db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(roomId);
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

  if (!(await isRoomAvailable(roomId, checkIn, checkOut))) {
    return res.status(409).json({ error: 'These dates are already booked. Please choose different dates.' });
  }

  const totalUsd = Number((dateCheck.nights * room.price_per_night_usd).toFixed(2));
  const converted = await convertFromUSD(totalUsd, currencyCode);

  const insertBooking = db.prepare(
    `INSERT INTO bookings (
      booking_code, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
      nights, guests_count, note, price_per_night_usd, total_usd, currency_code,
      exchange_rate, total_in_currency, payment_option, payment_status, booking_status
    ) VALUES (
      @booking_code, @room_id, @guest_name, @guest_email, @guest_phone, @check_in, @check_out,
      @nights, @guests_count, @note, @price_per_night_usd, @total_usd, @currency_code,
      @exchange_rate, @total_in_currency, @payment_option, 'pending', 'pending'
    )`
  );

  let code = '';
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    code = bookingCode();
    try {
      await insertBooking.run({
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
      break;
    } catch (error) {
      const isDuplicateCode = /UNIQUE constraint failed: bookings.booking_code/i.test(error.message || '');
      if (!isDuplicateCode || attempt === maxAttempts) throw error;
    }
  }

  sendNewBookingNotification({
    booking_code: code,
    room_name: room.name,
    check_in: checkIn,
    check_out: checkOut,
    nights: dateCheck.nights,
    guests_count: parsedGuests,
    total_in_currency: converted.total,
    currency_code: converted.currency,
    payment_option: paymentOption,
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    note
  }).catch((error) => {
    console.error('[email] Unexpected error sending new-booking notification:', error.message);
  });

  return res.status(201).json({
    message: 'Booking request created successfully. Waiting for admin confirmation.',
    bookingCode: code,
    receiptUrl: `/receipt/${code}`
  });
});

app.get('/api/public/bookings/:code', async (req, res) => {
  const booking = await db
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

app.get('/api/public/rooms/:roomId/unavailable', async (req, res) => {
  const roomId = Number(req.params.roomId);
  if (!roomId) {
    return res.status(400).json({ error: 'Invalid room id.' });
  }

  return res.json({ ranges: await getConfirmedRanges(roomId) });
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

app.get('/receipt/:code', apiLimiter, async (req, res) => {
  const booking = await db
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

  const settings = await getSettings();

  const statusClass = booking.booking_status === 'confirmed' ? 'badge-confirmed' : booking.booking_status === 'cancelled' ? 'badge-cancelled' : 'badge-pending';

  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt ${booking.booking_code}</title>
        <link rel="stylesheet" href="/receipt.css" />
      </head>
      <body>
        <div class="receipt">
          <div class="top">
            <div>
              <h1>${escapeHtml(settings.logo_text)} - Booking Receipt</h1>
              <div>${escapeHtml(settings.site_name)}</div>
            </div>
            <span class="badge ${statusClass}">${escapeHtml(booking.booking_status)}</span>
          </div>

          <div class="grid">
            <div><div class="label">Booking Code</div><div class="value">${escapeHtml(booking.booking_code)}</div></div>
            <div><div class="label">Guest</div><div class="value">${escapeHtml(booking.guest_name)}</div></div>
            <div><div class="label">Room</div><div class="value">${escapeHtml(booking.room_name)}</div></div>
            <div><div class="label">Dates</div><div class="value">${escapeHtml(booking.check_in)} to ${escapeHtml(booking.check_out)}</div></div>
            <div><div class="label">Nights</div><div class="value">${escapeHtml(booking.nights)}</div></div>
            <div><div class="label">Guests</div><div class="value">${escapeHtml(booking.guests_count)}</div></div>
            <div><div class="label">Contact</div><div class="value">${escapeHtml(booking.guest_email)}<br/>${escapeHtml(booking.guest_phone)}</div></div>
            <div><div class="label">Payment Option</div><div class="value">${escapeHtml(paymentOptionLabel(booking.payment_option))}</div></div>
            <div><div class="label">Payment Status</div><div class="value">${escapeHtml(booking.payment_status)}</div></div>
          </div>

          <div class="amount">Your total price will be confirmed with you directly.</div>
          <div class="footer">Generated on ${new Date().toISOString().slice(0, 10)} | Domain: ${escapeHtml(settings.domain)}</div>
        </div>
      </body>
    </html>
  `);
});

app.post('/api/admin/login', adminLoginLimiter, async (req, res) => {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = await db.prepare('SELECT id, email, full_name, password_hash FROM admins WHERE lower(email) = lower(?)').get(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  req.session.regenerate((regenerateError) => {
    if (regenerateError) {
      console.error(regenerateError);
      return res.status(500).json({ error: 'Unexpected server error.' });
    }

    req.session.adminId = admin.id;
    req.session.adminName = admin.full_name;

    return res.json({ id: admin.id, fullName: admin.full_name, email: admin.email });
  });
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

app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  res.json({
    summary: await adminSummary(),
    settings: await getSettings(),
    rooms: await getAllRooms(),
    links: await getPlatformLinks(),
    contentPages: await getContentPages(),
    heroSlides: await getHeroSlides(),
    chatbot: await getChatbotSettings(),
    chatbotFaqs: await getChatbotFaqs()
  });
});

app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  const bookings = await db
    .prepare(
      `SELECT b.*, r.name AS room_name
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       ORDER BY b.created_at DESC`
    )
    .all();

  return res.json({ bookings });
});

app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
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

  const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (bookingStatus === 'confirmed') {
    const free = await isRoomAvailable(booking.room_id, booking.check_in, booking.check_out, bookingId);
    if (!free) {
      return res.status(409).json({ error: 'Cannot confirm. The room has overlapping confirmed dates.' });
    }
  }

  await db.prepare(
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

  const statusKey = bookingStatus === 'confirmed' || bookingStatus === 'cancelled' ? bookingStatus : paymentStatus === 'paid' ? 'paid' : null;
  if (statusKey) {
    const updatedBooking = await db
      .prepare(
        `SELECT b.*, r.name AS room_name
         FROM bookings b
         JOIN rooms r ON r.id = b.room_id
         WHERE b.id = ?`
      )
      .get(bookingId);
    sendBookingStatusEmail(updatedBooking, statusKey).catch((error) => {
      console.error('[email] Unexpected error sending booking status email:', error.message);
    });
  }

  return res.json({ ok: true });
});

app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  const bookingId = Number(req.params.id);
  const booking = await db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  await db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  return res.json({ ok: true });
});

app.post('/api/admin/rooms', requireAdmin, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const shortDescription = String(req.body.shortDescription || '').trim();
  const longDescription = String(req.body.longDescription || '').trim();
  const pricePerNightUsd = Number(req.body.pricePerNightUsd);
  const maxGuests = Number(req.body.maxGuests);
  const sizeLabel = String(req.body.sizeLabel || '').trim();
  const bedSize = String(req.body.bedSize || '').trim();
  const featured = req.body.featured === true;
  const active = req.body.active !== false;
  const amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [];

  if (!name || !shortDescription || !longDescription || !sizeLabel) {
    return res.status(400).json({ error: 'Please fill all required room fields.' });
  }

  if (!(pricePerNightUsd > 0) || !(maxGuests >= 1)) {
    return res.status(400).json({ error: 'Price and max guests must be valid positive values.' });
  }

  const slugBase = slugify(name);
  let slug = slugBase;
  let i = 1;

  while (await db.prepare('SELECT id FROM rooms WHERE slug = ?').get(slug)) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }

  const result = await db
    .prepare(
      `INSERT INTO rooms (
        name, slug, short_description, long_description, price_per_night_usd,
        max_guests, size_label, bed_size, featured, active, amenities_json
      ) VALUES (
        @name, @slug, @short_description, @long_description, @price_per_night_usd,
        @max_guests, @size_label, @bed_size, @featured, @active, @amenities_json
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
      bed_size: bedSize,
      featured: featured ? 1 : 0,
      active: active ? 1 : 0,
      amenities_json: JSON.stringify(amenities)
    });

  return res.status(201).json({ id: result.lastInsertRowid, slug });
});

app.put('/api/admin/rooms/:id', requireAdmin, async (req, res) => {
  const roomId = Number(req.params.id);
  const room = await db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const name = String(req.body.name || room.name).trim();
  const shortDescription = String(req.body.shortDescription || room.short_description).trim();
  const longDescription = String(req.body.longDescription || room.long_description).trim();
  const parsedPrice = req.body.pricePerNightUsd !== undefined ? Number(req.body.pricePerNightUsd) : Number(room.price_per_night_usd);
  const parsedMaxGuests = req.body.maxGuests !== undefined ? Number(req.body.maxGuests) : Number(room.max_guests);
  const sizeLabel = String(req.body.sizeLabel || room.size_label).trim();
  const bedSize = req.body.bedSize === undefined ? room.bed_size || '' : String(req.body.bedSize || '').trim();
  const featured = typeof req.body.featured === 'boolean' ? (req.body.featured ? 1 : 0) : room.featured;
  const active = typeof req.body.active === 'boolean' ? (req.body.active ? 1 : 0) : room.active;
  const amenities = Array.isArray(req.body.amenities) ? req.body.amenities : JSON.parse(room.amenities_json || '[]');
  const coverImage = req.body.coverImage === undefined ? room.cover_image || '' : String(req.body.coverImage || '').trim();

  if (!(parsedPrice > 0) || !(parsedMaxGuests >= 1)) {
    return res.status(400).json({ error: 'Price and max guests must be valid positive values.' });
  }

  await db.prepare(
    `UPDATE rooms
     SET name = @name,
         short_description = @short_description,
         long_description = @long_description,
         price_per_night_usd = @price_per_night_usd,
         max_guests = @max_guests,
         size_label = @size_label,
         bed_size = @bed_size,
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
    bed_size: bedSize,
    featured,
    active,
    amenities_json: JSON.stringify(amenities),
    cover_image: coverImage
  });

  return res.json({ ok: true });
});

app.put('/api/admin/rooms/:roomId/cover', requireAdmin, async (req, res) => {
  const roomId = Number(req.params.roomId);
  const imageId = Number(req.body.imageId);

  if (!roomId || !imageId) {
    return res.status(400).json({ error: 'roomId and imageId are required.' });
  }

  const image = await db.prepare('SELECT * FROM room_images WHERE id = ? AND room_id = ?').get(imageId, roomId);
  if (!image) {
    return res.status(404).json({ error: 'Image not found in this room.' });
  }

  await db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(image.image_url, roomId);

  return res.json({ ok: true, coverImage: image.image_url });
});

app.delete('/api/admin/rooms/:id', requireAdmin, async (req, res) => {
  const roomId = Number(req.params.id);

  const hasBookings = (await db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE room_id = ?').get(roomId)).count;
  if (hasBookings > 0) {
    return res.status(400).json({ error: 'Room has bookings. Set it as inactive instead of deleting.' });
  }

  const images = await db.prepare('SELECT image_url FROM room_images WHERE room_id = ?').all(roomId);
  for (const row of images) {
    await removeUploadByUrl(row.image_url);
    removeRelatedOriginalByProcessedUrl(row.image_url);
  }

  await db.prepare('DELETE FROM room_images WHERE room_id = ?').run(roomId);
  await db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);

  return res.json({ ok: true });
});

app.post('/api/admin/rooms/:id/images', requireAdmin, upload.single('image'), async (req, res) => {
  const roomId = Number(req.params.id);
  const room = await db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  let imageUrl = '';

  try {
    const settings = await getSettings();
    imageUrl = await processAndSaveUpload({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      relativeFolder: 'rooms',
      originalsDir: roomOriginalDir,
      logoText: settings.logo_text,
      mode: 'room'
    });

    const result = await db
      .prepare(
        `INSERT INTO room_images (room_id, image_url, caption, sort_order)
         VALUES (?, ?, ?, ?)`
      )
      .run(roomId, imageUrl, String(req.body.caption || '').trim(), Number(req.body.sortOrder || 0));

    if (!room.cover_image) {
      await db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(imageUrl, roomId);
    }

    return res.status(201).json({ id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    if (imageUrl) await removeUploadByUrl(imageUrl);
    return res.status(500).json({ error: 'Image upload failed.' });
  }
});

app.delete('/api/admin/images/:id', requireAdmin, async (req, res) => {
  const imageId = Number(req.params.id);
  const image = await db.prepare('SELECT * FROM room_images WHERE id = ?').get(imageId);
  if (!image) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  await db.prepare('DELETE FROM room_images WHERE id = ?').run(imageId);
  await removeUploadByUrl(image.image_url);
  removeRelatedOriginalByProcessedUrl(image.image_url);

  const room = await db.prepare('SELECT id, cover_image FROM rooms WHERE id = ?').get(image.room_id);
  if (room && room.cover_image === image.image_url) {
    const fallback = await db.prepare('SELECT image_url FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id DESC LIMIT 1').get(image.room_id);
    await db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fallback?.image_url || '', image.room_id);
  }

  return res.json({ ok: true });
});

app.post('/api/admin/settings/hero-image', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  let imageUrl = '';

  try {
    const settings = await getSettings();
    imageUrl = await processAndSaveUpload({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      relativeFolder: 'site',
      originalsDir: siteOriginalDir,
      logoText: settings.logo_text,
      mode: 'hero'
    });

    await db.prepare('UPDATE site_settings SET hero_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(imageUrl);

    await removeUploadByUrl(settings.hero_image);
    removeRelatedOriginalByProcessedUrl(settings.hero_image);

    return res.json({ imageUrl });
  } catch (error) {
    if (imageUrl) await removeUploadByUrl(imageUrl);
    return res.status(500).json({ error: 'Hero image upload failed.' });
  }
});

app.post('/api/admin/hero-slides', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  let imageUrl = '';

  try {
    const settings = await getSettings();
    imageUrl = await processAndSaveUpload({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      relativeFolder: 'site',
      originalsDir: siteOriginalDir,
      logoText: settings.logo_text,
      mode: 'slide'
    });

    const sortOrder = Number(req.body.sortOrder || Date.now());
    const caption = String(req.body.caption || '').trim();

    const result = await db
      .prepare('INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (?, ?, ?)')
      .run(imageUrl, caption, sortOrder);

    return res.status(201).json({ id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    if (imageUrl) await removeUploadByUrl(imageUrl);
    return res.status(500).json({ error: 'Hero slide upload failed.' });
  }
});

app.put('/api/admin/hero-slides/order', requireAdmin, async (req, res) => {
  const slideIds = Array.isArray(req.body.slideIds) ? req.body.slideIds.map((id) => Number(id)).filter(Boolean) : [];
  if (!slideIds.length) {
    return res.status(400).json({ error: 'slideIds is required.' });
  }

  const updateSort = db.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?');
  const trx = db.transaction(async () => {
    for (const [index, id] of slideIds.entries()) {
      await updateSort.run(index + 1, id);
    }
  });

  await trx();
  return res.json({ ok: true });
});

app.delete('/api/admin/hero-slides/:id', requireAdmin, async (req, res) => {
  const slideId = Number(req.params.id);
  const slide = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(slideId);
  if (!slide) {
    return res.status(404).json({ error: 'Hero slide not found.' });
  }

  await db.prepare('DELETE FROM hero_slides WHERE id = ?').run(slideId);

  const usedByRoom = (await db.prepare('SELECT COUNT(*) AS count FROM room_images WHERE image_url = ?').get(slide.image_url)).count > 0;
  const usedByCover = (await db.prepare('SELECT COUNT(*) AS count FROM rooms WHERE cover_image = ?').get(slide.image_url)).count > 0;
  const usedBySettings = (await db.prepare('SELECT hero_image FROM site_settings WHERE id = 1').get()).hero_image === slide.image_url;
  const usedByContentPage = (await db.prepare('SELECT COUNT(*) AS count FROM content_pages WHERE image_url = ?').get(slide.image_url)).count > 0;
  const usedByOtherSlides = (await db.prepare('SELECT COUNT(*) AS count FROM hero_slides WHERE image_url = ?').get(slide.image_url)).count > 0;

  if (!usedByRoom && !usedByCover && !usedBySettings && !usedByContentPage && !usedByOtherSlides) {
    await removeUploadByUrl(slide.image_url);
    removeRelatedOriginalByProcessedUrl(slide.image_url);
  }

  return res.json({ ok: true });
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
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

  await db.prepare(
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

app.put('/api/admin/platform-links', requireAdmin, async (req, res) => {
  const links = Array.isArray(req.body.links) ? req.body.links : [];

  const trx = db.transaction(async () => {
    await db.prepare('DELETE FROM platform_links').run();

    const insert = db.prepare('INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (?, ?, ?, ?)');
    for (const [index, link] of links.entries()) {
      const platformName = String(link.platformName || '').trim();
      const url = String(link.url || '').trim();
      const icon = String(link.icon || 'link').trim();
      if (platformName && /^https?:\/\//.test(url)) {
        await insert.run(platformName, url, icon, Number(link.sortOrder ?? index + 1));
      }
    }
  });

  await trx();
  return res.json({ ok: true });
});

app.put('/api/admin/page-content', requireAdmin, async (req, res) => {
  const pages = Array.isArray(req.body.pages) ? req.body.pages : [];
  const allowedSlugs = new Set(['eat-sip', 'property', 'about']);

  const trx = db.transaction(async () => {
    const upsert = db.prepare(
      `INSERT INTO content_pages (
        slug, nav_label, title, subtitle, body, highlights_json, image_url, icon, sort_order, active, updated_at
      ) VALUES (
        @slug, @nav_label, @title, @subtitle, @body, @highlights_json, @image_url, @icon, @sort_order, @active, CURRENT_TIMESTAMP
      )
      ON CONFLICT(slug) DO UPDATE SET
        nav_label = excluded.nav_label,
        title = excluded.title,
        subtitle = excluded.subtitle,
        body = excluded.body,
        highlights_json = excluded.highlights_json,
        image_url = excluded.image_url,
        icon = excluded.icon,
        sort_order = excluded.sort_order,
        active = excluded.active,
        updated_at = CURRENT_TIMESTAMP`
    );

    for (const [index, page] of pages.entries()) {
      const slug = slugify(page.slug || '');
      if (!allowedSlugs.has(slug)) continue;

      const navLabel = String(page.navLabel || '').trim();
      const title = String(page.title || '').trim();
      const subtitle = String(page.subtitle || '').trim();
      const body = String(page.body || '').trim();
      const icon = String(page.icon || 'sparkles').trim();
      const highlights = Array.isArray(page.highlights)
        ? page.highlights.map((item) => String(item || '').trim()).filter(Boolean)
        : [];

      if (!navLabel || !title || !body) {
        throw new Error('Each page needs a nav label, title, and body.');
      }

      await upsert.run({
        slug,
        nav_label: navLabel,
        title,
        subtitle,
        body,
        highlights_json: JSON.stringify(highlights),
        image_url: String(page.imageUrl || page.image_url || '').trim(),
        icon,
        sort_order: Number(page.sortOrder || index + 1),
        active: page.active === false ? 0 : 1
      });
    }
  });

  try {
    await trx();
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to save page content.' });
  }
});

app.post('/api/admin/page-content/:slug/image', requireAdmin, upload.single('image'), async (req, res) => {
  const slug = slugify(req.params.slug || '');
  const allowedSlugs = new Set(['eat-sip', 'property', 'about']);
  if (!allowedSlugs.has(slug)) {
    return res.status(400).json({ error: 'Unsupported page.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  let imageUrl = '';

  try {
    const settings = await getSettings();
    const page = await db.prepare('SELECT * FROM content_pages WHERE slug = ?').get(slug);
    imageUrl = await processAndSaveUpload({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      relativeFolder: 'site',
      originalsDir: siteOriginalDir,
      logoText: settings.logo_text,
      mode: 'slide'
    });

    await db.prepare('UPDATE content_pages SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?').run(imageUrl, slug);

    if (page?.image_url && page.image_url !== imageUrl) {
      const usedByRoom = (await db.prepare('SELECT COUNT(*) AS count FROM room_images WHERE image_url = ?').get(page.image_url)).count > 0;
      const usedByCover = (await db.prepare('SELECT COUNT(*) AS count FROM rooms WHERE cover_image = ?').get(page.image_url)).count > 0;
      const usedBySettings = (await db.prepare('SELECT hero_image FROM site_settings WHERE id = 1').get()).hero_image === page.image_url;
      const usedBySlides = (await db.prepare('SELECT COUNT(*) AS count FROM hero_slides WHERE image_url = ?').get(page.image_url)).count > 0;
      const usedByOtherPages = (await db
        .prepare('SELECT COUNT(*) AS count FROM content_pages WHERE image_url = ? AND slug != ?')
        .get(page.image_url, slug)).count > 0;

      if (!usedByRoom && !usedByCover && !usedBySettings && !usedBySlides && !usedByOtherPages) {
        await removeUploadByUrl(page.image_url);
        removeRelatedOriginalByProcessedUrl(page.image_url);
      }
    }

    return res.status(201).json({ imageUrl });
  } catch (error) {
    if (imageUrl) await removeUploadByUrl(imageUrl);
    return res.status(500).json({ error: 'Page image upload failed.' });
  }
});

app.put('/api/admin/chatbot-settings', requireAdmin, async (req, res) => {
  const title = String(req.body.title || '').trim();
  const greeting = String(req.body.greeting || '').trim();
  const whatsappNumber = String(req.body.whatsappNumber || '').replace(/[^\d]/g, '');
  const whatsappMessage = String(req.body.whatsappMessage || '').trim();
  const enabled = req.body.enabled === false ? 0 : 1;

  if (!title || !greeting || !whatsappNumber || !whatsappMessage) {
    return res.status(400).json({ error: 'Please complete chatbot settings fields.' });
  }

  if (whatsappNumber.length < 8) {
    return res.status(400).json({ error: 'WhatsApp number is too short.' });
  }

  await db.prepare(
    `UPDATE chatbot_settings
     SET title = @title,
         greeting = @greeting,
         whatsapp_number = @whatsapp_number,
         whatsapp_message = @whatsapp_message,
         enabled = @enabled,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run({
    title,
    greeting,
    whatsapp_number: whatsappNumber,
    whatsapp_message: whatsappMessage,
    enabled
  });

  return res.json({ ok: true });
});

app.put('/api/admin/chatbot-faqs', requireAdmin, async (req, res) => {
  const faqs = Array.isArray(req.body.faqs) ? req.body.faqs : [];

  const trx = db.transaction(async () => {
    await db.prepare('DELETE FROM chatbot_faqs').run();

    const insert = db.prepare('INSERT INTO chatbot_faqs (question, answer, sort_order) VALUES (?, ?, ?)');
    for (const [index, faq] of faqs.entries()) {
      const question = String(faq.question || '').trim();
      const answer = String(faq.answer || '').trim();
      if (!question || !answer) continue;

      await insert.run(question, answer, Number(faq.sortOrder ?? index + 1));
    }
  });

  await trx();
  return res.json({ ok: true });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get(['/rooms', '/eat-sip', '/bomagawani', '/offers-prices', '/contact'], (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/about-us', (req, res) => {
  res.redirect(301, '/contact');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `Image is too large. Max allowed size is ${maxUploadSizeMb}MB.` });
    }

    return res.status(400).json({ error: 'Upload request is invalid. Please try again with one image file.' });
  }

  if (error?.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

// Vercel imports this file as a serverless function handler and never calls
// listen() itself - it just invokes the exported app per request. Everywhere
// else (local dev, Docker, Render) keeps running the familiar long-lived
// server via app.listen().
if (!isVercel) {
  app.listen(port, () => {
    console.log(`Bomagawani app running on http://localhost:${port}`);
  });
}

module.exports = app;
