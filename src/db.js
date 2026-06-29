const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bomagawani.db');
const contentSnapshotPath = path.resolve(process.env.CONTENT_SNAPSHOT_FILE || path.join(process.cwd(), 'data', 'content.snapshot.json'));
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

CREATE TABLE IF NOT EXISTS content_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  nav_label TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body TEXT NOT NULL,
  highlights_json TEXT NOT NULL DEFAULT '[]',
  image_url TEXT,
  icon TEXT NOT NULL DEFAULT 'sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS chatbot_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT NOT NULL,
  greeting TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  whatsapp_message TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function asString(value, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asInt(value, fallback = 0) {
  return Math.round(asNumber(value, fallback));
}

function asBoolInt(value, fallback = 0) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 1 || value === '1') return 1;
  if (value === 0 || value === '0') return 0;
  return fallback ? 1 : 0;
}

function readContentSnapshot() {
  if (!fs.existsSync(contentSnapshotPath)) return null;

  try {
    const raw = fs.readFileSync(contentSnapshotPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.warn('Invalid content snapshot file. Skipping sync.', error.message);
    return null;
  }
}

function applyContentSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;

  const applyTransaction = db.transaction((payload) => {
    if (payload.siteSettings && typeof payload.siteSettings === 'object') {
      const current = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();

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
             hero_image = @hero_image,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`
      ).run({
        site_name: asString(payload.siteSettings.site_name ?? payload.siteSettings.siteName, current.site_name),
        domain: asString(payload.siteSettings.domain, current.domain),
        headline: asString(payload.siteSettings.headline, current.headline),
        subheadline: asString(payload.siteSettings.subheadline, current.subheadline),
        about_text: asString(payload.siteSettings.about_text ?? payload.siteSettings.aboutText, current.about_text),
        address: asString(payload.siteSettings.address, current.address),
        map_link: asString(payload.siteSettings.map_link ?? payload.siteSettings.mapLink, current.map_link),
        contact_phone: asString(payload.siteSettings.contact_phone ?? payload.siteSettings.contactPhone, current.contact_phone),
        contact_email: asString(payload.siteSettings.contact_email ?? payload.siteSettings.contactEmail, current.contact_email),
        check_in_time: asString(payload.siteSettings.check_in_time ?? payload.siteSettings.checkInTime, current.check_in_time),
        check_out_time: asString(payload.siteSettings.check_out_time ?? payload.siteSettings.checkOutTime, current.check_out_time),
        base_currency: asString(payload.siteSettings.base_currency ?? payload.siteSettings.baseCurrency, current.base_currency),
        logo_text: asString(payload.siteSettings.logo_text ?? payload.siteSettings.logoText, current.logo_text),
        hero_image: asString(payload.siteSettings.hero_image ?? payload.siteSettings.heroImage, current.hero_image || '')
      });
    }

    if (Array.isArray(payload.platformLinks)) {
      db.prepare('DELETE FROM platform_links').run();
      const insertLink = db.prepare(
        'INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (@platform_name, @url, @icon, @sort_order)'
      );

      payload.platformLinks.forEach((link, index) => {
        insertLink.run({
          platform_name: asString(link.platform_name ?? link.platformName, `Platform ${index + 1}`),
          url: asString(link.url, '#'),
          icon: asString(link.icon, 'link'),
          sort_order: asInt(link.sort_order ?? link.sortOrder, index + 1)
        });
      });
    }

    if (Array.isArray(payload.contentPages)) {
      const upsertPage = db.prepare(
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

      payload.contentPages.forEach((page, index) => {
        const slug = slugify(page.slug);
        if (!slug) return;

        const highlights = Array.isArray(page.highlights)
          ? page.highlights.map((item) => asString(item)).filter(Boolean)
          : [];

        upsertPage.run({
          slug,
          nav_label: asString(page.nav_label ?? page.navLabel, slug),
          title: asString(page.title, slug),
          subtitle: asString(page.subtitle),
          body: asString(page.body),
          highlights_json: JSON.stringify(highlights),
          image_url: asString(page.image_url ?? page.imageUrl),
          icon: asString(page.icon, 'sparkles'),
          sort_order: asInt(page.sort_order ?? page.sortOrder, index + 1),
          active: asBoolInt(page.active, 1)
        });
      });
    }

    if (Array.isArray(payload.heroSlides)) {
      db.prepare('DELETE FROM hero_slides').run();
      const insertSlide = db.prepare(
        'INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (@image_url, @caption, @sort_order)'
      );

      payload.heroSlides.forEach((slide, index) => {
        const imageUrl = asString(slide.image_url ?? slide.imageUrl);
        if (!imageUrl) return;

        insertSlide.run({
          image_url: imageUrl,
          caption: asString(slide.caption),
          sort_order: asInt(slide.sort_order ?? slide.sortOrder, index + 1)
        });
      });
    }

    if (payload.chatbot && typeof payload.chatbot === 'object') {
      const current = db.prepare('SELECT * FROM chatbot_settings WHERE id = 1').get();
      db.prepare(
        `UPDATE chatbot_settings
         SET title = @title,
             greeting = @greeting,
             whatsapp_number = @whatsapp_number,
             whatsapp_message = @whatsapp_message,
             enabled = @enabled,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`
      ).run({
        title: asString(payload.chatbot.title, current?.title || 'Quick Help'),
        greeting: asString(payload.chatbot.greeting, current?.greeting || 'Hi. Ask me anything about rooms, prices, check-in, or booking.'),
        whatsapp_number: asString(payload.chatbot.whatsapp_number ?? payload.chatbot.whatsappNumber, current?.whatsapp_number || '255756906006'),
        whatsapp_message: asString(payload.chatbot.whatsapp_message ?? payload.chatbot.whatsappMessage, current?.whatsapp_message || 'Hello Bomagawani, I need help with booking.'),
        enabled: asBoolInt(payload.chatbot.enabled, current ? current.enabled : 1)
      });
    }

    if (Array.isArray(payload.chatbotFaqs)) {
      db.prepare('DELETE FROM chatbot_faqs').run();
      const insertFaq = db.prepare(
        'INSERT INTO chatbot_faqs (question, answer, sort_order) VALUES (@question, @answer, @sort_order)'
      );

      payload.chatbotFaqs.forEach((item, index) => {
        const question = asString(item.question);
        const answer = asString(item.answer);
        if (!question || !answer) return;

        insertFaq.run({
          question,
          answer,
          sort_order: asInt(item.sort_order ?? item.sortOrder, index + 1)
        });
      });
    }

    if (Array.isArray(payload.rooms) && payload.rooms.length > 0) {
      const insertRoom = db.prepare(
        `INSERT INTO rooms (
          name, slug, short_description, long_description, price_per_night_usd,
          max_guests, size_label, featured, amenities_json, cover_image, active, updated_at
        ) VALUES (
          @name, @slug, @short_description, @long_description, @price_per_night_usd,
          @max_guests, @size_label, @featured, @amenities_json, @cover_image, @active, CURRENT_TIMESTAMP
        )`
      );

      const updateRoom = db.prepare(
        `UPDATE rooms
         SET name = @name,
             short_description = @short_description,
             long_description = @long_description,
             price_per_night_usd = @price_per_night_usd,
             max_guests = @max_guests,
             size_label = @size_label,
             featured = @featured,
             amenities_json = @amenities_json,
             cover_image = @cover_image,
             active = @active,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      );

      const deleteRoomImages = db.prepare('DELETE FROM room_images WHERE room_id = ?');
      const insertRoomImage = db.prepare(
        'INSERT INTO room_images (room_id, image_url, caption, sort_order) VALUES (@room_id, @image_url, @caption, @sort_order)'
      );

      payload.rooms.forEach((room, index) => {
        const roomName = asString(room.name, `Room ${index + 1}`);
        const roomSlug = asString(room.slug, slugify(roomName)) || `room-${Date.now()}-${index + 1}`;
        const existingRoom = db.prepare('SELECT * FROM rooms WHERE slug = ?').get(roomSlug);

        const roomPayload = {
          name: roomName,
          slug: roomSlug,
          short_description: asString(room.short_description ?? room.shortDescription, existingRoom?.short_description || ''),
          long_description: asString(room.long_description ?? room.longDescription, existingRoom?.long_description || ''),
          price_per_night_usd: Math.max(1, asNumber(room.price_per_night_usd ?? room.pricePerNightUsd, existingRoom?.price_per_night_usd || 1)),
          max_guests: Math.max(1, asInt(room.max_guests ?? room.maxGuests, existingRoom?.max_guests || 1)),
          size_label: asString(room.size_label ?? room.sizeLabel, existingRoom?.size_label || 'Room size'),
          featured: asBoolInt(room.featured, existingRoom?.featured || 0),
          amenities_json: JSON.stringify(Array.isArray(room.amenities) ? room.amenities : []),
          cover_image: asString(room.cover_image ?? room.coverImage, existingRoom?.cover_image || ''),
          active: asBoolInt(room.active, existingRoom ? existingRoom.active : 1)
        };

        let roomId = existingRoom?.id || null;
        if (roomId) {
          updateRoom.run({ ...roomPayload, id: roomId });
        } else {
          const inserted = insertRoom.run(roomPayload);
          roomId = Number(inserted.lastInsertRowid);
        }

        deleteRoomImages.run(roomId);
        const imageRows = Array.isArray(room.images) ? room.images : [];

        imageRows.forEach((image, imageIndex) => {
          const imageUrl = asString(image.image_url ?? image.imageUrl);
          if (!imageUrl) return;

          insertRoomImage.run({
            room_id: roomId,
            image_url: imageUrl,
            caption: asString(image.caption),
            sort_order: asInt(image.sort_order ?? image.sortOrder, imageIndex + 1)
          });
        });

        if (!roomPayload.cover_image && imageRows.length > 0) {
          const firstImage = imageRows.find((image) => asString(image.image_url ?? image.imageUrl));
          if (firstImage) {
            db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
              asString(firstImage.image_url ?? firstImage.imageUrl),
              roomId
            );
          }
        }
      });
    }
  });

  try {
    applyTransaction(snapshot);
  } catch (error) {
    console.warn('Content snapshot sync failed. Keeping current DB data.', error.message);
  }
}

function hasColumn(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().some((column) => column.name === columnName);
}

if (!hasColumn('bookings', 'payment_option')) {
  db.exec("ALTER TABLE bookings ADD COLUMN payment_option TEXT NOT NULL DEFAULT 'pay_on_arrival'");
}

if (!hasColumn('content_pages', 'image_url')) {
  db.exec('ALTER TABLE content_pages ADD COLUMN image_url TEXT');
}

function seedContentPages() {
  const insertPage = db.prepare(
    `INSERT OR IGNORE INTO content_pages (
      slug, nav_label, title, subtitle, body, highlights_json, icon, sort_order, active
    ) VALUES (
      @slug, @nav_label, @title, @subtitle, @body, @highlights_json, @icon, @sort_order, @active
    )`
  );

  [
    {
      slug: 'eat-sip',
      nav_label: 'Eat & Sip',
      title: 'Eat & Sip by the Coast',
      subtitle: 'Fresh coastal foods, cool drinks, and flavors prepared with local care.',
      body: 'Enjoy delicious coastal meals inspired by Tanga flavors: seafood, rice dishes, grilled bites, fresh fruit, tropical juices, tea, coffee, and relaxed evening drinks. The experience is warm, simple, and made for guests who want to taste the place they are staying in.',
      highlights: [
        'Fresh seafood and coastal home-style cooking',
        'Local ingredients prepared with clean kitchen standards',
        'Breakfast, tea, coffee, fresh juice, and soft drinks',
        'Meal preparation can be arranged around guest plans'
      ],
      icon: 'utensils-crossed',
      sort_order: 1
    },
    {
      slug: 'property',
      nav_label: 'Bomagawani',
      title: 'Bomagawani House Details',
      subtitle: 'A coastal house-rent stay designed for comfort, privacy, and easy hosting.',
      body: 'Bomagawani brings together room rental, hospitality, food, drinks, and guest support in one calm property experience. It is ideal for travelers, families, couples, and business guests who want direct booking and clear communication.',
      highlights: [
        'Private rooms with practical amenities',
        'Guest support, booking receipts, and status tracking',
        'Coastal location with map directions',
        'Admin-managed rooms, photos, prices, and content'
      ],
      icon: 'home',
      sort_order: 2
    },
    {
      slug: 'about',
      nav_label: 'Contact',
      title: 'Contact Bomagawani',
      subtitle: 'Reach us for room bookings, food requests, directions, and guest support.',
      body: 'Contact Bomagawani before you arrive, ask about room availability, request meals and drinks, or get directions to the house in Kigombe.',
      highlights: [
        'Call or WhatsApp for quick guest support',
        'Ask about rooms, food, drinks, and arrival time',
        'Use map directions to reach Kigombe easily',
        'Track your booking with your booking code'
      ],
      icon: 'phone-call',
      sort_order: 3
    }
  ].forEach((page) => {
    insertPage.run({
      ...page,
      highlights_json: JSON.stringify(page.highlights),
      active: 1
    });
  });
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
    headline: 'Bomagawani House Rent',
    subheadline: 'A calm Kigombe retreat with private rooms, fresh local meals, shaded veranda living, and simple direct booking.',
    about_text: 'Bomagawani House Rent combines private rooms, warm local hosting, coastal meals, and clear direct booking for guests visiting Kigombe on Tanzania’s northern Swahili Coast.',
    address: 'Kigombe, Tanga, Tanzania',
    map_link: 'https://www.google.com/maps?q=Kigombe,+Tanga,+Tanzania',
    contact_phone: '+255 756 906 006',
    contact_email: 'stay@bomagawani.com',
    check_in_time: '14:00',
    check_out_time: '11:00',
    logo_text: 'Bomagawani.com',
    hero_image: ''
  });
}

db.prepare(`
  UPDATE site_settings
  SET contact_phone = '+255 756 906 006'
  WHERE contact_phone = '+255 700 000 000'
`).run();

seedContentPages();

const eatSipPage = db.prepare("SELECT title, body FROM content_pages WHERE slug = 'eat-sip'").get();
if (
  eatSipPage?.title === 'Eat & Sip by the Coast' &&
  eatSipPage?.body?.startsWith('Enjoy delicious coastal meals inspired by Tanga flavors')
) {
  db.prepare(
    `UPDATE content_pages
     SET subtitle = @subtitle,
         body = @body,
         highlights_json = @highlights_json,
         updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'eat-sip'`
  ).run({
    subtitle: 'Coastal meals, fresh drinks, and on-request food booking for guests and visitors.',
    body: 'Eat & Sip is for house guests and visitors who want simple coastal food, fresh drinks, or both together. Come for a meal, arrange breakfast, request lunch or dinner, or ask for a small food plan prepared around available local ingredients.',
    highlights_json: JSON.stringify([
      'Visitors can come just to eat, drink, or enjoy both together',
      'On-request breakfast, lunch, dinner, and small group meals',
      'Tanzania coastal-style seafood, rice dishes, tea, coffee, and fresh juices',
      'Food preparation is confirmed based on availability and guest plans'
    ])
  });
}

const propertyPage = db.prepare("SELECT title, body FROM content_pages WHERE slug = 'property'").get();
if (
  propertyPage?.title === 'Bomagawani House Details' &&
  propertyPage?.body?.startsWith('Bomagawani brings together room rental')
) {
  db.prepare(
    `UPDATE content_pages
     SET title = @title,
         subtitle = @subtitle,
         body = @body,
         highlights_json = @highlights_json,
         icon = @icon,
         updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'property'`
  ).run({
    title: 'Bomagawani House For Sale',
    subtitle: 'A coastal Kigombe property with private rooms, guest-ready living, and buyer viewing available.',
    body: 'Bomagawani is more than a room-rent stay. The house is also available for sale, with coastal character, practical services, shaded living, and access to the Tanga area. Buyers can request the full details, photos, videos, and a viewing appointment before visiting.',
    highlights_json: JSON.stringify([
      'House for sale - price on request',
      'Private rooms and guest-ready layout',
      'Near Tanzania’s northern Swahili Coast',
      'Viewing, photos, and video tour available on request'
    ]),
    icon: 'home'
  });
}

const buyerContactPage = db.prepare("SELECT title, body FROM content_pages WHERE slug = 'about'").get();
if (
  buyerContactPage?.title === 'Contact Bomagawani' &&
  buyerContactPage?.body?.startsWith('Contact Bomagawani before you arrive')
) {
  db.prepare(
    `UPDATE content_pages
     SET subtitle = @subtitle,
         body = @body,
         highlights_json = @highlights_json,
         icon = @icon,
         updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'about'`
  ).run({
    subtitle: 'Ask about rooms, food, directions, or arrange a house-sale viewing.',
    body: 'Send a quick inquiry and tell us what you need: a room booking, food and drinks, directions, or a time to view the house for sale.',
    highlights_json: JSON.stringify([
      'Room booking and arrival questions',
      'Food and drink requests',
      'House sale viewing appointments',
      'Photos, video, map, and buyer details'
    ]),
    icon: 'phone-call'
  });
}

const currentSettings = db.prepare('SELECT headline, subheadline FROM site_settings WHERE id = 1').get();
if (
  currentSettings?.headline === 'Beautiful Coastal Stays in Kigombe' ||
  currentSettings?.headline === 'Coastal rooms, food, and easy booking in Kigombe'
) {
  db.prepare(
    `UPDATE site_settings
     SET headline = ?,
         subheadline = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run(
    'Bomagawani House Rent',
    'A calm Kigombe retreat with private rooms, fresh local meals, shaded veranda living, and simple direct booking.'
  );
}

const contactPage = db.prepare("SELECT nav_label, title FROM content_pages WHERE slug = 'about'").get();
if (contactPage?.nav_label === 'About Us' && contactPage?.title === 'About Bomagawani') {
  db.prepare(
    `UPDATE content_pages
     SET nav_label = @nav_label,
         title = @title,
         subtitle = @subtitle,
         body = @body,
         highlights_json = @highlights_json,
         icon = @icon,
         updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'about'`
  ).run({
    nav_label: 'Contact',
    title: 'Contact Bomagawani',
    subtitle: 'Reach us for room bookings, food requests, directions, and guest support.',
    body: 'Contact Bomagawani before you arrive, ask about room availability, request meals and drinks, or get directions to the house in Kigombe.',
    highlights_json: JSON.stringify([
      'Call or WhatsApp for quick guest support',
      'Ask about rooms, food, drinks, and arrival time',
      'Use map directions to reach Kigombe easily',
      'Track your booking with your booking code'
    ]),
    icon: 'phone-call'
  });
}

const roomsCount = db.prepare('SELECT COUNT(*) AS count FROM rooms').get().count;
if (!roomsCount) {
  const insertRoom = db.prepare(`
    INSERT INTO rooms (
      name, slug, short_description, long_description, price_per_night_usd, max_guests, size_label, featured, amenities_json, cover_image
    ) VALUES (@name, @slug, @short_description, @long_description, @price_per_night_usd, @max_guests, @size_label, @featured, @amenities_json, @cover_image)
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
    cover_image: '',
    amenities_json: JSON.stringify([
      { icon: 'wifi', label: 'Fast Wi-Fi' },
      { icon: 'waves', label: 'Beach View' },
      { icon: 'utensils', label: 'Sea Food' },
      { icon: 'wind', label: 'Fresh Air' },
      { icon: 'waves', label: 'Swimming' },
      { icon: 'zap', label: 'Electricity 24hrs' },
      { icon: 'glass-water', label: 'Drinks' }
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
    cover_image: '/uploads/rooms/guest-room-main.jpg',
    amenities_json: JSON.stringify([
      { icon: 'wifi', label: 'Fast Wi-Fi' },
      { icon: 'utensils', label: 'Sea Food' },
      { icon: 'wind', label: 'Fresh Air' },
      { icon: 'waves', label: 'Swimming' },
      { icon: 'zap', label: 'Electricity 24hrs' },
      { icon: 'glass-water', label: 'Drinks' }
    ])
  });
}

function ensureGuestRoomDefaultImages() {
  const guestRoom = db.prepare("SELECT id, cover_image FROM rooms WHERE slug = 'guest-room'").get();
  if (!guestRoom) return;

  const guestImages = db
    .prepare('SELECT image_url FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id ASC')
    .all(guestRoom.id);

  const defaultImages = [
    { image_url: '/uploads/rooms/guest-room-main.jpg', caption: 'Guest Room main view', sort_order: 1 },
    { image_url: '/uploads/rooms/guest-room-alt.jpg', caption: 'Guest Room bed view', sort_order: 2 }
  ];

  const hasDefaultImages = defaultImages.every((image) => guestImages.some((row) => row.image_url === image.image_url));
  const needsDefaultImages = !guestImages.length || !guestRoom.cover_image || String(guestRoom.cover_image).includes('images.unsplash.com');

  if (!needsDefaultImages && hasDefaultImages) return;

  const replaceImages = db.transaction(() => {
    db.prepare('DELETE FROM room_images WHERE room_id = ?').run(guestRoom.id);
    const insertImage = db.prepare(
      'INSERT INTO room_images (room_id, image_url, caption, sort_order) VALUES (@room_id, @image_url, @caption, @sort_order)'
    );

    defaultImages.forEach((image) => {
      insertImage.run({
        room_id: guestRoom.id,
        image_url: image.image_url,
        caption: image.caption,
        sort_order: image.sort_order
      });
    });

    db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(defaultImages[0].image_url, guestRoom.id);
  });

  replaceImages();
}

ensureGuestRoomDefaultImages();

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

const chatbotSettingsCount = db.prepare('SELECT COUNT(*) AS count FROM chatbot_settings').get().count;
if (!chatbotSettingsCount) {
  db.prepare(
    `INSERT INTO chatbot_settings (
      id, title, greeting, whatsapp_number, whatsapp_message, enabled
    ) VALUES (
      1, @title, @greeting, @whatsapp_number, @whatsapp_message, @enabled
    )`
  ).run({
    title: 'Quick Help',
    greeting: 'Hi. Ask me anything about rooms, prices, check-in, or booking.',
    whatsapp_number: '255756906006',
    whatsapp_message: 'Hello Bomagawani, I need help with booking.',
    enabled: 1
  });
}

db.prepare(`
  UPDATE chatbot_settings
  SET whatsapp_number = '255756906006'
  WHERE whatsapp_number = '255700000000'
`).run();

const chatbotFaqCount = db.prepare('SELECT COUNT(*) AS count FROM chatbot_faqs').get().count;
if (!chatbotFaqCount) {
  const insertFaq = db.prepare('INSERT INTO chatbot_faqs (question, answer, sort_order) VALUES (?, ?, ?)');
  insertFaq.run('Which rooms are available?', 'Master Bedroom and Guest Room are available. More can be added by admin.', 1);
  insertFaq.run('What time is check-in and check-out?', 'Check-in starts at 14:00 and check-out is 11:00.', 2);
  insertFaq.run('How can I confirm my booking?', 'Submit your booking request and our team will confirm quickly. You get a booking code instantly.', 3);
}

function applyAmenityUpgrade() {
  const masterRoom = db.prepare("SELECT id FROM rooms WHERE slug = 'master-bedroom'").get();
  if (!masterRoom) return;

  const defaultAmenityPool = [
    { icon: 'wifi', label: 'Fast Wi-Fi' },
    { icon: 'waves', label: 'Beach View' },
    { icon: 'utensils', label: 'Sea Food' },
    { icon: 'wind', label: 'Fresh Air' },
    { icon: 'waves', label: 'Swimming' },
    { icon: 'zap', label: 'Electricity 24hrs' },
    { icon: 'glass-water', label: 'Drinks' }
  ];

  const rooms = db.prepare("SELECT id, amenities_json FROM rooms WHERE slug IN ('master-bedroom', 'guest-room')").all();
  rooms.forEach((room) => {
    const current = JSON.parse(room.amenities_json || '[]');
    const hasLegacyAmenities = current.some((item) => ['Private Bathroom', 'Coffee Station', 'Air Conditioning'].includes(item.label));
    if (!hasLegacyAmenities) return;

    const mergedByLabel = new Map();
    current.forEach((item) => {
      if (['Private Bathroom', 'Coffee Station', 'Air Conditioning'].includes(item.label)) return;
      const label = asString(item.label);
      if (!label) return;
      mergedByLabel.set(label.toLowerCase(), { icon: asString(item.icon, 'sparkles'), label });
    });

    defaultAmenityPool.forEach((item) => {
      if (!mergedByLabel.has(item.label.toLowerCase())) {
        mergedByLabel.set(item.label.toLowerCase(), item);
      }
    });

    db.prepare('UPDATE rooms SET amenities_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      JSON.stringify([...mergedByLabel.values()]),
      room.id
    );
  });
}

applyAmenityUpgrade();

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

applyContentSnapshot(readContentSnapshot());
applyAmenityUpgrade();

const syncedSettings = db.prepare('SELECT headline FROM site_settings WHERE id = 1').get();
if (
  syncedSettings?.headline === 'Beautiful Coastal Stays in Kigombe' ||
  syncedSettings?.headline === 'Coastal rooms, food, and easy booking in Kigombe'
) {
  db.prepare(
    `UPDATE site_settings
     SET headline = ?,
         subheadline = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run(
    'Bomagawani House Rent',
    'A calm Kigombe retreat with private rooms, fresh local meals, shaded veranda living, and simple direct booking.'
  );
}

const syncedContactPage = db.prepare("SELECT nav_label, title FROM content_pages WHERE slug = 'about'").get();
if (syncedContactPage?.nav_label === 'About Us' && syncedContactPage?.title === 'About Bomagawani') {
  db.prepare(
    `UPDATE content_pages
     SET nav_label = @nav_label,
         title = @title,
         subtitle = @subtitle,
         body = @body,
         highlights_json = @highlights_json,
         icon = @icon,
         updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'about'`
  ).run({
    nav_label: 'Contact',
    title: 'Contact Bomagawani',
    subtitle: 'Reach us for room bookings, food requests, directions, and guest support.',
    body: 'Contact Bomagawani before you arrive, ask about room availability, request meals and drinks, or get directions to the house in Kigombe.',
    highlights_json: JSON.stringify([
      'Call or WhatsApp for quick guest support',
      'Ask about rooms, food, drinks, and arrival time',
      'Use map directions to reach Kigombe easily',
      'Track your booking with your booking code'
    ]),
    icon: 'phone-call'
  });
}

module.exports = db;
