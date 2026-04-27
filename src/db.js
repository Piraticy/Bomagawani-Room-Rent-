const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bomagawani.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  headline TEXT NOT NULL,
  subheadline TEXT NOT NULL,
  about_text TEXT NOT NULL,
  address TEXT NOT NULL,
  map_link TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  logo_text TEXT NOT NULL,
  hero_image TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  price_per_night_usd REAL NOT NULL,
  max_guests INTEGER NOT NULL,
  size_label TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  amenities_json TEXT NOT NULL,
  cover_image TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_code TEXT NOT NULL UNIQUE,
  room_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  nights INTEGER NOT NULL,
  guests_count INTEGER NOT NULL,
  note TEXT,
  price_per_night_usd REAL NOT NULL,
  total_usd REAL NOT NULL,
  currency_code TEXT NOT NULL,
  exchange_rate REAL NOT NULL,
  total_in_currency REAL NOT NULL,
  payment_option TEXT NOT NULL DEFAULT 'pay_on_arrival',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exchange_cache (
  base_currency TEXT PRIMARY KEY,
  rates_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function hasColumn(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().some((column) => column.name === columnName);
}

if (!hasColumn('bookings', 'payment_option')) {
  db.exec("ALTER TABLE bookings ADD COLUMN payment_option TEXT NOT NULL DEFAULT 'pay_on_arrival'");
}

const settingsCount = db.prepare('SELECT COUNT(*) AS count FROM site_settings').get().count;
if (!settingsCount) {
  db.prepare(`
    INSERT INTO site_settings (
      id, site_name, domain, headline, subheadline, about_text, address, map_link,
      contact_phone, contact_email, check_in_time, check_out_time, base_currency, logo_text, hero_image
    ) VALUES (
      1,
      @site_name,
      @domain,
      @headline,
      @subheadline,
      @about_text,
      @address,
      @map_link,
      @contact_phone,
      @contact_email,
      @check_in_time,
      @check_out_time,
      'USD',
      @logo_text,
      @hero_image
    )
  `).run({
    site_name: 'Bomagawani House Rent',
    domain: 'Bomagawani.com',
    headline: 'Beautiful Coastal Stays in Kigombe',
    subheadline: 'Book your room in minutes with instant availability.',
    about_text: 'Bomagawani House Rent combines warm hospitality, modern comfort, and simple digital booking for travelers and families.',
    address: 'Kigombe, Tanga, Tanzania',
    map_link: 'https://www.google.com/maps?q=Kigombe,+Tanga,+Tanzania',
    contact_phone: '+255 700 000 000',
    contact_email: 'stay@bomagawani.com',
    check_in_time: '14:00',
    check_out_time: '11:00',
    logo_text: 'Bomagawani.com',
    hero_image: ''
  });
}

const roomsCount = db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count;
if (!roomsCount) {
  const insertRoom = db.prepare(`
    INSERT INTO rooms (
      name, slug, short_description, long_description, price_per_night_usd, max_guests, size_label, featured, amenities_json
    ) VALUES (@name, @slug, @short_description, @long_description, @price_per_night_usd, @max_guests, @size_label, @featured, @amenities_json)
  `);

  insertRoom.run({
    name: 'Master Bedroom',
    slug: 'master-bedroom',
    short_description: 'Premium private suite with balcony and ocean breeze.',
    long_description: 'The Master Bedroom is ideal for couples or executives seeking comfort, privacy, and premium in-room relaxation.',
    price_per_night_usd: 120,
    max_guests: 2,
    size_label: '38 m2',
    featured: 1,
    amenities_json: JSON.stringify([
      { icon: 'wifi', label: 'Fast Wi-Fi' },
      { icon: 'waves', label: 'Beach View' },
      { icon: 'bath', label: 'Private Bathroom' },
      { icon: 'coffee', label: 'Coffee Station' },
      { icon: 'tv', label: 'Smart TV' }
    ])
  });

  insertRoom.run({
    name: 'Guest Room',
    slug: 'guest-room',
    short_description: 'Comfortable and affordable room for short or long stays.',
    long_description: 'The Guest Room offers a calm, clean, and budget-friendly option while still giving access to the full property experience.',
    price_per_night_usd: 75,
    max_guests: 2,
    size_label: '24 m2',
    featured: 0,
    amenities_json: JSON.stringify([
      { icon: 'wifi', label: 'Fast Wi-Fi' },
      { icon: 'fan', label: 'Ceiling Fan' },
      { icon: 'bath', label: 'Private Bathroom' },
      { icon: 'shirt', label: 'Wardrobe' }
    ])
  });
}

const linksCount = db.prepare('SELECT COUNT(*) AS count FROM platform_links').get().count;
if (!linksCount) {
  const insertLink = db.prepare('INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (?, ?, ?, ?)');
  insertLink.run('Book Direct', 'https://bomagawani.com', 'calendar-check', 1);
  insertLink.run('Booking.com', 'https://www.booking.com', 'hotel', 2);
  insertLink.run('Tripadvisor', 'https://www.tripadvisor.com', 'map-pin', 3);
  insertLink.run('Google Travel', 'https://www.google.com/travel/', 'plane', 4);
}

const adminCount = db.prepare('SELECT COUNT(*) AS count FROM admins').get().count;
if (!adminCount) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bomagawani.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)').run('Main Admin', adminEmail, passwordHash);
}

const masterRoom = db.prepare("SELECT id, amenities_json FROM rooms WHERE slug = 'master-bedroom'").get();
if (masterRoom) {
  const amenities = JSON.parse(masterRoom.amenities_json || '[]');
  let changed = false;

  const normalizedAmenities = amenities.map((item) => {
    if (item.label === 'Air Conditioning') {
      changed = true;
      return { icon: 'waves', label: 'Beach View' };
    }
    return item;
  });

  const hasBeachView = normalizedAmenities.some((item) => item.label === 'Beach View');
  if (!hasBeachView) {
    changed = true;
    normalizedAmenities.push({ icon: 'waves', label: 'Beach View' });
  }

  if (changed) {
    db.prepare('UPDATE rooms SET amenities_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      JSON.stringify(normalizedAmenities),
      masterRoom.id
    );
  }
}

const heroSlidesCount = db.prepare('SELECT COUNT(*) AS count FROM hero_slides').get().count;
if (!heroSlidesCount) {
  const insertSlide = db.prepare('INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (?, ?, ?)');
  const settings = db.prepare('SELECT hero_image FROM site_settings WHERE id = 1').get();
  const roomCovers = db.prepare("SELECT cover_image FROM rooms WHERE cover_image IS NOT NULL AND cover_image != '' ORDER BY featured DESC, id ASC").all();

  const uniqueImages = [];
  const seen = new Set();

  const pushImage = (imageUrl) => {
    if (!imageUrl || seen.has(imageUrl)) return;
    seen.add(imageUrl);
    uniqueImages.push(imageUrl);
  };

  pushImage(settings?.hero_image);
  roomCovers.forEach((row) => pushImage(row.cover_image));

  uniqueImages.forEach((imageUrl, index) => {
    insertSlide.run(imageUrl, '', index + 1);
  });
}

module.exports = db;
