const fs = require('fs');
const path = require('path');

const db = require('../db');

const outputPath = path.resolve(process.env.CONTENT_SNAPSHOT_FILE || path.join(process.cwd(), 'data', 'content.snapshot.json'));

function getRoomImages(roomId) {
  return db
    .prepare('SELECT image_url, caption, sort_order FROM room_images WHERE room_id = ? ORDER BY sort_order ASC, id ASC')
    .all(roomId)
    .map((image) => ({
      imageUrl: image.image_url,
      caption: image.caption || '',
      sortOrder: Number(image.sort_order || 0)
    }));
}

const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
const rooms = db.prepare('SELECT * FROM rooms ORDER BY featured DESC, id ASC').all();
const platformLinks = db.prepare('SELECT * FROM platform_links ORDER BY sort_order ASC, id ASC').all();
const heroSlides = db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC').all();

const snapshot = {
  exportedAt: new Date().toISOString(),
  siteSettings: {
    siteName: settings.site_name,
    domain: settings.domain,
    headline: settings.headline,
    subheadline: settings.subheadline,
    aboutText: settings.about_text,
    address: settings.address,
    mapLink: settings.map_link,
    contactPhone: settings.contact_phone,
    contactEmail: settings.contact_email,
    checkInTime: settings.check_in_time,
    checkOutTime: settings.check_out_time,
    baseCurrency: settings.base_currency,
    logoText: settings.logo_text,
    heroImage: settings.hero_image || ''
  },
  rooms: rooms.map((room) => ({
    name: room.name,
    slug: room.slug,
    shortDescription: room.short_description,
    longDescription: room.long_description,
    pricePerNightUsd: Number(room.price_per_night_usd),
    maxGuests: Number(room.max_guests),
    sizeLabel: room.size_label,
    featured: Boolean(room.featured),
    active: Boolean(room.active),
    coverImage: room.cover_image || '',
    amenities: JSON.parse(room.amenities_json || '[]'),
    images: getRoomImages(room.id)
  })),
  platformLinks: platformLinks.map((link) => ({
    platformName: link.platform_name,
    url: link.url,
    icon: link.icon,
    sortOrder: Number(link.sort_order || 0)
  })),
  heroSlides: heroSlides.map((slide) => ({
    imageUrl: slide.image_url,
    caption: slide.caption || '',
    sortOrder: Number(slide.sort_order || 0)
  }))
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Content snapshot exported to ${outputPath}`);
