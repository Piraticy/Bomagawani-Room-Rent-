# Bomagawani House Rent Platform

Complete booking platform for **Bomagawani.com** with production-ready backend, frontend, and deployment files.

## What Is Included

- Professional mobile-friendly landing page
- Direct booking with live availability checks
- Currency conversion for quote and booking totals
- Booking status tracking with booking code
- Printable receipt page per booking
- Installable web app support (PWA)
- SEO support (`sitemap.xml`, `robots.txt`, structured data)
- Admin dashboard for no-code updates:
  - Site details and content
  - Room details, pricing, amenities, active/inactive
  - Photo upload with automatic logo watermark
  - Set room cover image and remove old photos
  - Travel platform links (Booking.com, Tripadvisor, etc.)
  - Booking confirmation/cancel/payment status updates
- Confirmed booking dates are blocked instantly for new bookings
- Security hardening:
  - Helmet headers
  - Rate limiting
  - Session protection
  - Upload validation

## Default Admin Login

- Email: `admin@bomagawani.com`
- Password: `Admin@12345`

Change these in `.env` before production.

## Local Run

```bash
npm install
cp .env.example .env
npm start
```

Open:

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Deployment Ready Files

- `Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`
- `ecosystem.config.cjs` (PM2 option)
- `.github/workflows/ci.yml` (automatic checks)

## Deploy With Docker

```bash
cp .env.example .env
# update secrets in .env

docker compose up -d --build
```

This starts:

- `app` (Node.js booking platform)
- `nginx` (reverse proxy on port 80)

## Environment Variables

```env
NODE_ENV=development
PORT=3000
TRUST_PROXY=0
SESSION_SECRET=replace-with-long-random-secret
ADMIN_EMAIL=admin@bomagawani.com
ADMIN_PASSWORD=Admin@12345
```

## Quick Health Check

- `GET /healthz`
- `GET /api/public/bootstrap`

## Business Flow

1. Guest opens landing page and chooses room + dates + currency.
2. Guest sends booking request and receives booking code + receipt link.
3. Admin reviews request and confirms/cancels from dashboard.
4. Confirmed dates are no longer selectable for that room.
5. Guest can track booking by booking code.

## Next Phase (When You Are Ready)

- Online payment gateway integration
- Official API integration with Booking.com / Tripadvisor partner systems
- Email and WhatsApp automated notifications
