const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@libsql/client');

const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bomagawani.db');
const contentSnapshotPath = path.resolve(process.env.CONTENT_SNAPSHOT_FILE || path.join(process.cwd(), 'data', 'content.snapshot.json'));

// TURSO_DATABASE_URL supports both a remote Turso database (libsql://...) and a
// local SQLite file (file:...). Defaulting to a local file keeps local dev and
// the existing Docker volume-backed deployment working exactly as before -
// only a hosted Vercel deployment needs to set TURSO_DATABASE_URL/TURSO_AUTH_TOKEN
// to a real Turso database.
const databaseUrl = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url: databaseUrl, authToken } : { url: databaseUrl });

function rowToObject(row, columns) {
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = row[i];
  });
  return obj;
}

function normalizeArgs(params) {
  if (params.length === 0) return undefined;
  if (params.length === 1 && params[0] !== null && typeof params[0] === 'object' && !Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

// Minimal better-sqlite3-compatible async shim over @libsql/client, so the
// rest of this file (and server.js) reads the same as the previous
// synchronous version, just with `await` in front of get/all/run/exec.
const db = {
  prepare(sql) {
    return {
      async run(...params) {
        const args = normalizeArgs(params);
        const result = await client.execute(args !== undefined ? { sql, args } : sql);
        return {
          changes: result.rowsAffected,
          lastInsertRowid: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : undefined
        };
      },
      async get(...params) {
        const args = normalizeArgs(params);
        const result = await client.execute(args !== undefined ? { sql, args } : sql);
        return result.rows.length ? rowToObject(result.rows[0], result.columns) : undefined;
      },
      async all(...params) {
        const args = normalizeArgs(params);
        const result = await client.execute(args !== undefined ? { sql, args } : sql);
        return result.rows.map((row) => rowToObject(row, result.columns));
      }
    };
  },
  async exec(sql) {
    await client.executeMultiple(sql);
  },
  // Simplified stand-in for better-sqlite3's synchronous db.transaction(fn):
  // returns an async function that just awaits the callback in place. This
  // drops real cross-statement atomicity, which is an acceptable trade-off
  // for the low-traffic admin-only call sites that use it (a partial write
  // on a mid-request crash is recoverable by re-saving from the admin UI).
  transaction(fn) {
    return async (...args) => fn(...args);
  }
};

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

async function applyContentSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;

  try {
    if (snapshot.siteSettings && typeof snapshot.siteSettings === 'object') {
      const current = await db.prepare('SELECT * FROM site_settings WHERE id = 1').get();

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
             hero_image = @hero_image,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`
      ).run({
        site_name: asString(snapshot.siteSettings.site_name ?? snapshot.siteSettings.siteName, current.site_name),
        domain: asString(snapshot.siteSettings.domain, current.domain),
        headline: asString(snapshot.siteSettings.headline, current.headline),
        subheadline: asString(snapshot.siteSettings.subheadline, current.subheadline),
        about_text: asString(snapshot.siteSettings.about_text ?? snapshot.siteSettings.aboutText, current.about_text),
        address: asString(snapshot.siteSettings.address, current.address),
        map_link: asString(snapshot.siteSettings.map_link ?? snapshot.siteSettings.mapLink, current.map_link),
        contact_phone: asString(snapshot.siteSettings.contact_phone ?? snapshot.siteSettings.contactPhone, current.contact_phone),
        contact_email: asString(snapshot.siteSettings.contact_email ?? snapshot.siteSettings.contactEmail, current.contact_email),
        check_in_time: asString(snapshot.siteSettings.check_in_time ?? snapshot.siteSettings.checkInTime, current.check_in_time),
        check_out_time: asString(snapshot.siteSettings.check_out_time ?? snapshot.siteSettings.checkOutTime, current.check_out_time),
        base_currency: asString(snapshot.siteSettings.base_currency ?? snapshot.siteSettings.baseCurrency, current.base_currency),
        logo_text: asString(snapshot.siteSettings.logo_text ?? snapshot.siteSettings.logoText, current.logo_text),
        hero_image: asString(snapshot.siteSettings.hero_image ?? snapshot.siteSettings.heroImage, current.hero_image || '')
      });
    }

    if (Array.isArray(snapshot.platformLinks)) {
      await db.prepare('DELETE FROM platform_links').run();
      const insertLink = db.prepare(
        'INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (@platform_name, @url, @icon, @sort_order)'
      );

      for (const [index, link] of snapshot.platformLinks.entries()) {
        await insertLink.run({
          platform_name: asString(link.platform_name ?? link.platformName, `Platform ${index + 1}`),
          url: asString(link.url, '#'),
          icon: asString(link.icon, 'link'),
          sort_order: asInt(link.sort_order ?? link.sortOrder, index + 1)
        });
      }
    }

    if (Array.isArray(snapshot.contentPages)) {
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

      for (const [index, page] of snapshot.contentPages.entries()) {
        const slug = slugify(page.slug);
        if (!slug) continue;

        const highlights = Array.isArray(page.highlights)
          ? page.highlights.map((item) => asString(item)).filter(Boolean)
          : [];

        await upsertPage.run({
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
      }
    }

    if (Array.isArray(snapshot.heroSlides)) {
      await db.prepare('DELETE FROM hero_slides').run();
      const insertSlide = db.prepare(
        'INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (@image_url, @caption, @sort_order)'
      );

      for (const [index, slide] of snapshot.heroSlides.entries()) {
        const imageUrl = asString(slide.image_url ?? slide.imageUrl);
        if (!imageUrl) continue;

        await insertSlide.run({
          image_url: imageUrl,
          caption: asString(slide.caption),
          sort_order: asInt(slide.sort_order ?? slide.sortOrder, index + 1)
        });
      }
    }

    if (snapshot.chatbot && typeof snapshot.chatbot === 'object') {
      const current = await db.prepare('SELECT * FROM chatbot_settings WHERE id = 1').get();
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
        title: asString(snapshot.chatbot.title, current?.title || 'Quick Help'),
        greeting: asString(snapshot.chatbot.greeting, current?.greeting || 'Hi. Ask me anything about rooms, prices, check-in, or booking.'),
        whatsapp_number: asString(snapshot.chatbot.whatsapp_number ?? snapshot.chatbot.whatsappNumber, current?.whatsapp_number || '255756906006'),
        whatsapp_message: asString(snapshot.chatbot.whatsapp_message ?? snapshot.chatbot.whatsappMessage, current?.whatsapp_message || 'Hello Bomagawani, I need help with booking.'),
        enabled: asBoolInt(snapshot.chatbot.enabled, current ? current.enabled : 1)
      });
    }

    if (Array.isArray(snapshot.chatbotFaqs)) {
      await db.prepare('DELETE FROM chatbot_faqs').run();
      const insertFaq = db.prepare(
        'INSERT INTO chatbot_faqs (question, answer, sort_order) VALUES (@question, @answer, @sort_order)'
      );

      for (const [index, item] of snapshot.chatbotFaqs.entries()) {
        const question = asString(item.question);
        const answer = asString(item.answer);
        if (!question || !answer) continue;

        await insertFaq.run({
          question,
          answer,
          sort_order: asInt(item.sort_order ?? item.sortOrder, index + 1)
        });
      }
    }

    if (Array.isArray(snapshot.rooms) && snapshot.rooms.length > 0) {
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

      for (const [index, room] of snapshot.rooms.entries()) {
        const roomName = asString(room.name, `Room ${index + 1}`);
        const roomSlug = asString(room.slug, slugify(roomName)) || `room-${Date.now()}-${index + 1}`;
        const existingRoom = await db.prepare('SELECT * FROM rooms WHERE slug = ?').get(roomSlug);

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
          await updateRoom.run({ ...roomPayload, id: roomId });
        } else {
          const inserted = await insertRoom.run(roomPayload);
          roomId = Number(inserted.lastInsertRowid);
        }

        await deleteRoomImages.run(roomId);
        const imageRows = Array.isArray(room.images) ? room.images : [];

        for (const [imageIndex, image] of imageRows.entries()) {
          const imageUrl = asString(image.image_url ?? image.imageUrl);
          if (!imageUrl) continue;

          await insertRoomImage.run({
            room_id: roomId,
            image_url: imageUrl,
            caption: asString(image.caption),
            sort_order: asInt(image.sort_order ?? image.sortOrder, imageIndex + 1)
          });
        }

        if (!roomPayload.cover_image && imageRows.length > 0) {
          const firstImage = imageRows.find((image) => asString(image.image_url ?? image.imageUrl));
          if (firstImage) {
            await db.prepare('UPDATE rooms SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
              asString(firstImage.image_url ?? firstImage.imageUrl),
              roomId
            );
          }
        }
      }
    }
  } catch (error) {
    console.warn('Content snapshot sync failed. Keeping current DB data.', error.message);
  }
}

async function hasColumn(tableName, columnName) {
  const columns = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
}

async function seedContentPages() {
  const insertPage = db.prepare(
    `INSERT OR IGNORE INTO content_pages (
      slug, nav_label, title, subtitle, body, highlights_json, icon, sort_order, active
    ) VALUES (
      @slug, @nav_label, @title, @subtitle, @body, @highlights_json, @icon, @sort_order, @active
    )`
  );

  const pages = [
    {
      slug: 'eat-sip',
      nav_label: 'Eat & Sip',
      title: 'Eat & Sip by the Coast',
      subtitle: 'Fresh ingredients, regional specialties, and warm hospitality make every meal a special experience. Look forward to freshly caught fish, tropical fruits, and lovingly prepared dishes in a relaxed atmosphere.',
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
  ];

  for (const page of pages) {
    await insertPage.run({
      ...page,
      highlights_json: JSON.stringify(page.highlights),
      active: 1
    });
  }
}

async function applyAmenityUpgrade() {
  const masterRoom = await db.prepare("SELECT id FROM rooms WHERE slug = 'master-bedroom'").get();
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

  const rooms = await db.prepare("SELECT id, amenities_json FROM rooms WHERE slug IN ('master-bedroom', 'guest-room')").all();
  for (const room of rooms) {
    const current = JSON.parse(room.amenities_json || '[]');
    const hasLegacyAmenities = current.some((item) => ['Private Bathroom', 'Coffee Station', 'Air Conditioning'].includes(item.label));
    if (!hasLegacyAmenities) continue;

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

    await db.prepare('UPDATE rooms SET amenities_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      JSON.stringify([...mergedByLabel.values()]),
      room.id
    );
  }
}

async function initialize() {
  await db.exec(`
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

CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expires_at INTEGER
);
`);

  if (!(await hasColumn('bookings', 'payment_option'))) {
    await db.exec("ALTER TABLE bookings ADD COLUMN payment_option TEXT NOT NULL DEFAULT 'pay_on_arrival'");
  }

  if (!(await hasColumn('content_pages', 'image_url'))) {
    await db.exec('ALTER TABLE content_pages ADD COLUMN image_url TEXT');
  }

  await seedContentPages();

  const settingsCount = (await db.prepare('SELECT COUNT(*) AS count FROM site_settings').get()).count;
  const isFreshDatabase = !settingsCount;
  if (!settingsCount) {
    await db.prepare(`
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
      about_text: 'Experience the unspoiled beauty of the Swahili Coast in northern Tanzania. Located directly on the Indian Ocean, a place of tranquility, warm hospitality, and unique natural beauty awaits you. Whether you\'re looking for a relaxing holiday, camping by the sea, or unforgettable discoveries – Bomagawani is your home away from home on the East African coast.',
      address: 'Kigombe, Tanga, Tanzania',
      map_link: 'https://maps.app.goo.gl/vpY5krcPsqJaYbLR6',
      contact_phone: '+255 756 906 006',
      contact_email: 'stay@bomagawani.com',
      check_in_time: '14:00',
      check_out_time: '11:00',
      logo_text: 'Bomagawani.com',
      hero_image: ''
    });
  }

  await db.prepare(`
    UPDATE site_settings
    SET contact_phone = '+255 756 906 006'
    WHERE contact_phone = '+255 700 000 000'
  `).run();

  const eatSipPage = await db.prepare("SELECT title, body FROM content_pages WHERE slug = 'eat-sip'").get();
  if (
    eatSipPage?.title === 'Eat & Sip by the Coast' &&
    eatSipPage?.body?.startsWith('Enjoy delicious coastal meals inspired by Tanga flavors')
  ) {
    await db.prepare(
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

  const eatSipSubtitle = await db.prepare("SELECT subtitle FROM content_pages WHERE slug = 'eat-sip'").get();
  if (
    eatSipSubtitle?.subtitle === 'Coastal meals, fresh drinks, and on-request food booking for guests and visitors.' ||
    eatSipSubtitle?.subtitle === 'Coastal meals, fresh drinks, and food requests for guests and visitors.'
  ) {
    await db.prepare(
      `UPDATE content_pages
       SET subtitle = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = 'eat-sip'`
    ).run(
      'Fresh ingredients, regional specialties, and warm hospitality make every meal a special experience. Look forward to freshly caught fish, tropical fruits, and lovingly prepared dishes in a relaxed atmosphere.'
    );
  }

  const propertyPage = await db.prepare("SELECT title, body FROM content_pages WHERE slug = 'property'").get();
  if (
    propertyPage?.title === 'Bomagawani House Details' &&
    propertyPage?.body?.startsWith('Bomagawani brings together room rental')
  ) {
    await db.prepare(
      `UPDATE content_pages
       SET title = @title,
           subtitle = @subtitle,
           body = @body,
           highlights_json = @highlights_json,
           image_url = @image_url,
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
      image_url: '/uploads/property/property-house-front.webp',
      icon: 'home'
    });
  }

  const propertyStoryPage = await db.prepare("SELECT title, subtitle FROM content_pages WHERE slug = 'property'").get();
  if (
    propertyStoryPage?.title === 'Bomagawani House For Sale' &&
    (propertyStoryPage?.subtitle === 'A coastal Kigombe property with private rooms, guest-ready living, and buyer viewing available.' ||
      propertyStoryPage?.subtitle === 'A coastal house-rent stay designed for comfort, privacy, and easy hosting.')
  ) {
    await db.prepare(
      `UPDATE content_pages
       SET title = @title,
           subtitle = @subtitle,
           body = @body,
           highlights_json = @highlights_json,
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = 'property'`
    ).run({
      title: 'Bomagawani – The Exclusive Villa on the Indian Ocean',
      subtitle: 'An exceptional villa in a stunning location awaits you directly on the Swahili Coast. Surrounded by tropical nature and the turquoise waters of the Indian Ocean, it combines traditional architecture with modern comfort – a place for peace, relaxation, and unforgettable moments.',
      body: 'Bomagawani was born from a shared dream of Eva and Hermann. With great passion, personal commitment, and genuine hospitality, we have created a place where guests from all over the world feel welcome and at home.',
      highlights_json: JSON.stringify([
        'Traditional Afro-Arab architecture with modern comfort',
        'Private rooms and guest-ready layout',
        'Near Tanzania’s northern Swahili Coast',
        'Viewing, photos, and video tour available on request'
      ])
    });
  }

  await db.prepare(`
    UPDATE content_pages
    SET image_url = '/uploads/property/property-house-front.webp',
        updated_at = CURRENT_TIMESTAMP
    WHERE slug = 'property'
      AND (image_url IS NULL OR image_url = '' OR image_url LIKE 'https://images.unsplash.com/%')
  `).run();

  const buyerContactPage = await db.prepare("SELECT title, body FROM content_pages WHERE slug = 'about'").get();
  if (
    buyerContactPage?.title === 'Contact Bomagawani' &&
    buyerContactPage?.body?.startsWith('Contact Bomagawani before you arrive')
  ) {
    await db.prepare(
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

  const currentSettings = await db.prepare('SELECT headline, subheadline FROM site_settings WHERE id = 1').get();
  if (
    currentSettings?.headline === 'Beautiful Coastal Stays in Kigombe' ||
    currentSettings?.headline === 'Coastal rooms, food, and easy booking in Kigombe'
  ) {
    await db.prepare(
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

  const currentAboutText = await db.prepare('SELECT about_text FROM site_settings WHERE id = 1').get();
  if (
    currentAboutText?.about_text === 'Bomagawani House Rent combines private rooms, warm local hosting, coastal meals, and clear direct booking for guests visiting Kigombe on Tanzania’s northern Swahili Coast.' ||
    currentAboutText?.about_text === 'Bomagawani House Rent combines private rooms, warm local hosting, coastal meals, and clear booking details for guests visiting Kigombe on Tanzania’s northern Swahili Coast.'
  ) {
    await db.prepare(
      `UPDATE site_settings
       SET about_text = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    ).run(
      'Experience the unspoiled beauty of the Swahili Coast in northern Tanzania. Located directly on the Indian Ocean, a place of tranquility, warm hospitality, and unique natural beauty awaits you. Whether you\'re looking for a relaxing holiday, camping by the sea, or unforgettable discoveries – Bomagawani is your home away from home on the East African coast.'
    );
  }

  const contactPage = await db.prepare("SELECT nav_label, title FROM content_pages WHERE slug = 'about'").get();
  if (contactPage?.nav_label === 'About Us' && contactPage?.title === 'About Bomagawani') {
    await db.prepare(
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

  const contactIntro = await db.prepare("SELECT subtitle, body FROM content_pages WHERE slug = 'about'").get();
  if (
    [
      'Ask about rooms, food, directions, or arrange a house viewing.',
      'Ask about rooms, food, directions, or arrange a house-sale viewing.',
      'Reach us for room bookings, food requests, directions, and guest support.'
    ].includes(contactIntro?.subtitle)
  ) {
    await db.prepare(
      `UPDATE content_pages
       SET subtitle = ?,
           body = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE slug = 'about'`
    ).run(
      'We look forward to welcoming you to Bomagawani.',
      'We are happy to answer your questions and help you plan your stay. Contact us – we will assist you personally and easily with your booking.'
    );
  }

  const roomsCount = (await db.prepare('SELECT COUNT(*) AS count FROM rooms').get()).count;
  if (!roomsCount) {
    const insertRoom = db.prepare(`
      INSERT INTO rooms (
        name, slug, short_description, long_description, price_per_night_usd, max_guests, size_label, featured, amenities_json, cover_image
      ) VALUES (@name, @slug, @short_description, @long_description, @price_per_night_usd, @max_guests, @size_label, @featured, @amenities_json, @cover_image)
    `);

    await insertRoom.run({
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

    await insertRoom.run({
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

  const linksCount = (await db.prepare('SELECT COUNT(*) AS count FROM platform_links').get()).count;
  if (!linksCount) {
    const insertLink = db.prepare('INSERT INTO platform_links (platform_name, url, icon, sort_order) VALUES (?, ?, ?, ?)');
    await insertLink.run('Book Direct', 'https://bomagawani.com', 'calendar-check', 1);
    await insertLink.run('Booking.com', 'https://www.booking.com', 'hotel', 2);
    await insertLink.run('Tripadvisor', 'https://www.tripadvisor.com', 'map-pin', 3);
    await insertLink.run('Google Travel', 'https://www.google.com/travel/', 'plane', 4);
  }

  const adminCount = (await db.prepare('SELECT COUNT(*) AS count FROM admins').get()).count;
  if (!adminCount) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bomagawani.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    await db.prepare('INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)').run('Main Admin', adminEmail, passwordHash);
  }

  const chatbotSettingsCount = (await db.prepare('SELECT COUNT(*) AS count FROM chatbot_settings').get()).count;
  if (!chatbotSettingsCount) {
    await db.prepare(
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

  await db.prepare(`
    UPDATE chatbot_settings
    SET whatsapp_number = '255756906006'
    WHERE whatsapp_number = '255700000000'
  `).run();

  const chatbotFaqCount = (await db.prepare('SELECT COUNT(*) AS count FROM chatbot_faqs').get()).count;
  if (!chatbotFaqCount) {
    const insertFaq = db.prepare('INSERT INTO chatbot_faqs (question, answer, sort_order) VALUES (?, ?, ?)');
    await insertFaq.run('Which rooms are available?', 'Master Bedroom and Guest Room are available. More can be added by admin.', 1);
    await insertFaq.run('What time is check-in and check-out?', 'Check-in starts at 14:00 and check-out is 11:00.', 2);
    await insertFaq.run('How can I confirm my booking?', 'Submit your booking request and our team will confirm quickly. You get a booking code instantly.', 3);
  }

  await applyAmenityUpgrade();

  const heroSlidesCount = (await db.prepare('SELECT COUNT(*) AS count FROM hero_slides').get()).count;
  if (!heroSlidesCount) {
    // Only ever fall back to the single site hero image, never room photos -
    // the homepage hero slideshow should show dedicated hero content only.
    const settings = await db.prepare('SELECT hero_image FROM site_settings WHERE id = 1').get();
    if (settings?.hero_image) {
      await db.prepare('INSERT INTO hero_slides (image_url, caption, sort_order) VALUES (?, ?, ?)').run(settings.hero_image, '', 1);
    }
  }

  if (isFreshDatabase) {
    // Only seed from the git-committed snapshot on a genuinely new database (e.g.
    // first boot, or a host with no persistent disk across redeploys). Re-running
    // this against an already-populated database - which happens any time a
    // separate process requires this module, including the content:export script
    // itself - would silently revert live admin edits (rooms, photos, settings)
    // back to whatever was last exported.
    await applyContentSnapshot(readContentSnapshot());
  }
  await applyAmenityUpgrade();

  const syncedSettings = await db.prepare('SELECT headline FROM site_settings WHERE id = 1').get();
  if (
    syncedSettings?.headline === 'Beautiful Coastal Stays in Kigombe' ||
    syncedSettings?.headline === 'Coastal rooms, food, and easy booking in Kigombe'
  ) {
    await db.prepare(
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

  const syncedContactPage = await db.prepare("SELECT nav_label, title FROM content_pages WHERE slug = 'about'").get();
  if (syncedContactPage?.nav_label === 'About Us' && syncedContactPage?.title === 'About Bomagawani') {
    await db.prepare(
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
}

const ready = initialize().catch((error) => {
  console.error('Database initialization failed:', error);
  throw error;
});

module.exports = { db, ready };
