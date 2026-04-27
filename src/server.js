require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');

const db = require('./db');
const { requireAdmin } = require('./middleware/auth');
const { convertFromUSD, fetchRates } = require('./services/currency');
const { watermarkImage } = require('./services/imageProcessor');

const app = express();
const port = Number(process.env.PORT || 3000);

const publicDir = path.join(process.cwd(), 'public');
const roomUploadDir = path.join(publicDir, 'uploads', 'rooms');
const siteUploadDir = path.join(publicDir, 'uploads', 'site');
const tempUploadDir = path.join(process.cwd(), 'tmp-uploads');

fs.mkdirSync(roomUploadDir, { recursive: true });
fs.mkdirSync(siteUploadDir, { recursive: true });
fs.mkdirSync(tempUploadDir, { recursive: true });

const upload = multer({
  dest: tempUploadDir,
  limits: {
    fileSize: 7 * 1024 * 1024
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
      sameSite: 'lax'
    }
  })
);

app.use(express.static(publicDir));

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function nightsBetween(checkIn, checkOut) {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff;
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

function isRoomAvailable(roomId, checkIn, checkOut) {
  const overlap = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM bookings
       WHERE room_id = @roomId
         AND booking_status = 'confirmed'
         AND NOT (check_out <= @checkIn OR check_in >= @checkOut)`
    )
    .get({ roomId, checkIn, checkOut });

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
      currencies: Object.keys(rates).filter((c) => ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'].includes(c))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load public data.' });
  }
});

app.get('/api/public/quote', async (req, res) => {
  const roomId = Number(req.query.roomId);
  const checkIn = req.query.checkIn;
  const checkOut = req.query.checkOut;
  const currency = (req.query.currency || 'USD').toUpperCase();

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'roomId, checkIn, and checkOut are required.' });
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  if (!isRoomAvailable(roomId, checkIn, checkOut)) {
    return res.status(409).json({ error: 'Selected dates are not available.' });
  }

  const totalUsd = Number((nights * room.price_per_night_usd).toFixed(2));
  const converted = await convertFromUSD(totalUsd, currency);

  return res.json({
    nights,
    roomName: room.name,
    pricePerNightUsd: room.price_per_night_usd,
    totalUsd,
    currency: converted.currency,
    exchangeRate: converted.rate,
    totalInCurrency: converted.total
  });
});

app.post('/api/public/bookings', async (req, res) => {
  const {
    roomId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guestsCount,
    note,
    currencyCode
  } = req.body;

  const parsedRoomId = Number(roomId);
  const parsedGuests = Number(guestsCount || 1);

  if (!parsedRoomId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !parsedGuests) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND active = 1').get(parsedRoomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (parsedGuests > room.max_guests) {
    return res.status(400).json({ error: `Maximum guests for ${room.name} is ${room.max_guests}.` });
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  if (!isRoomAvailable(parsedRoomId, checkIn, checkOut)) {
    return res.status(409).json({ error: 'These dates are already booked. Please choose different dates.' });
  }

  const totalUsd = Number((nights * room.price_per_night_usd).toFixed(2));
  const converted = await convertFromUSD(totalUsd, currencyCode || 'USD');
  const code = bookingCode();

  db.prepare(
    `INSERT INTO bookings (
      booking_code, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
      nights, guests_count, note, price_per_night_usd, total_usd, currency_code,
      exchange_rate, total_in_currency, payment_status, booking_status
    ) VALUES (
      @booking_code, @room_id, @guest_name, @guest_email, @guest_phone, @check_in, @check_out,
      @nights, @guests_count, @note, @price_per_night_usd, @total_usd, @currency_code,
      @exchange_rate, @total_in_currency, 'pending', 'pending'
    )`
  ).run({
    booking_code: code,
    room_id: parsedRoomId,
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    check_in: checkIn,
    check_out: checkOut,
    nights,
    guests_count: parsedGuests,
    note: note || '',
    price_per_night_usd: room.price_per_night_usd,
    total_usd: totalUsd,
    currency_code: converted.currency,
    exchange_rate: converted.rate,
    total_in_currency: converted.total
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
    .get(req.params.code.toUpperCase());

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
    const target = (req.query.currency || 'USD').toUpperCase();
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
    .get(req.params.code.toUpperCase());

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
            <div><div class="label">Payment Status</div><div class="value">${booking.payment_status}</div></div>
          </div>

          <div class="amount">Total: ${booking.total_in_currency} ${booking.currency_code}</div>
          <div class="footer">Generated on ${new Date().toISOString().slice(0, 10)} | Domain: ${settings.domain}</div>
        </div>
      </body>
    </html>
  `);
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
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
    links: getPlatformLinks()
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
  const { bookingStatus, paymentStatus } = req.body;

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (bookingStatus === 'confirmed') {
    const free = isRoomAvailable(booking.room_id, booking.check_in, booking.check_out);
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
  const {
    name,
    shortDescription,
    longDescription,
    pricePerNightUsd,
    maxGuests,
    sizeLabel,
    featured,
    active,
    amenities
  } = req.body;

  if (!name || !shortDescription || !longDescription || !pricePerNightUsd || !maxGuests || !sizeLabel) {
    return res.status(400).json({ error: 'Please fill all required room fields.' });
  }

  const slugBase = slugify(name);
  let slug = slugBase;
  let i = 1;

  while (db.prepare('SELECT id FROM rooms WHERE slug = ?').get(slug)) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }

  const parsedAmenities = Array.isArray(amenities) ? amenities : [];

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
      price_per_night_usd: Number(pricePerNightUsd),
      max_guests: Number(maxGuests),
      size_label: sizeLabel,
      featured: featured ? 1 : 0,
      active: active === false ? 0 : 1,
      amenities_json: JSON.stringify(parsedAmenities)
    });

  return res.status(201).json({ id: result.lastInsertRowid, slug });
});

app.put('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const {
    name,
    shortDescription,
    longDescription,
    pricePerNightUsd,
    maxGuests,
    sizeLabel,
    featured,
    active,
    amenities,
    coverImage
  } = req.body;

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
    name: name || room.name,
    short_description: shortDescription || room.short_description,
    long_description: longDescription || room.long_description,
    price_per_night_usd: Number(pricePerNightUsd || room.price_per_night_usd),
    max_guests: Number(maxGuests || room.max_guests),
    size_label: sizeLabel || room.size_label,
    featured: featured ? 1 : 0,
    active: active === false ? 0 : 1,
    amenities_json: JSON.stringify(Array.isArray(amenities) ? amenities : JSON.parse(room.amenities_json || '[]')),
    cover_image: coverImage || room.cover_image || ''
  });

  return res.json({ ok: true });
});

app.delete('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const roomId = Number(req.params.id);

  const hasBookings = db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE room_id = ?').get(roomId).count;
  if (hasBookings > 0) {
    return res.status(400).json({ error: 'Room has bookings. Set it as inactive instead of deleting.' });
  }

  db.prepare('DELETE FROM room_images WHERE room_id = ?').run(roomId);
  db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);

  return res.json({ ok: true });
});

app.post('/api/admin/rooms/:id/images', requireAdmin, upload.single('image'), async (req, res) => {
  const roomId = Number(req.params.id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    if (req.file?.path) fs.rmSync(req.file.path, { force: true });
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const settings = getSettings();
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
    const outputPath = path.join(roomUploadDir, filename);

    await watermarkImage(req.file.path, outputPath, settings.logo_text);

    const imageUrl = `/uploads/rooms/${filename}`;

    const result = db
      .prepare(
        `INSERT INTO room_images (room_id, image_url, caption, sort_order)
         VALUES (?, ?, ?, ?)`
      )
      .run(roomId, imageUrl, req.body.caption || '', Number(req.body.sortOrder || 0));

    if (!room.cover_image) {
      db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(imageUrl, roomId);
    }

    fs.rmSync(req.file.path, { force: true });

    return res.status(201).json({ id: result.lastInsertRowid, imageUrl });
  } catch (error) {
    if (req.file?.path) fs.rmSync(req.file.path, { force: true });
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

  const filePath = path.join(publicDir, image.image_url.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }

  return res.json({ ok: true });
});

app.post('/api/admin/settings/hero-image', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  try {
    const settings = getSettings();
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
    const outputPath = path.join(siteUploadDir, filename);

    await watermarkImage(req.file.path, outputPath, settings.logo_text);

    const imageUrl = `/uploads/site/${filename}`;
    db.prepare('UPDATE site_settings SET hero_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(imageUrl);

    fs.rmSync(req.file.path, { force: true });

    return res.json({ imageUrl });
  } catch (error) {
    if (req.file?.path) fs.rmSync(req.file.path, { force: true });
    return res.status(500).json({ error: 'Hero image upload failed.' });
  }
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const {
    siteName,
    domain,
    headline,
    subheadline,
    aboutText,
    address,
    mapLink,
    contactPhone,
    contactEmail,
    checkInTime,
    checkOutTime,
    baseCurrency,
    logoText
  } = req.body;

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
    base_currency: (baseCurrency || 'USD').toUpperCase(),
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
      if (link.platformName && link.url) {
        insert.run(link.platformName, link.url, link.icon || 'link', Number(link.sortOrder ?? index + 1));
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

app.listen(port, () => {
  console.log(`Bomagawani app running on http://localhost:${port}`);
});
