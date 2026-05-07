# Bomagawani House Rent Platform

Complete booking platform for **Bomagawani.com** with production-ready backend, frontend, and deployment files.

## What Is Included

- Professional mobile-friendly landing page
- Direct booking with live availability checks
- Payment option support (including **Pay on Arrival**)
- Currency conversion for quote and booking totals
- Booking status tracking with booking code
- Printable receipt page per booking
- Installable web app support (PWA)
- One-time install prompt (does not stay on screen)
- Language suggestion prompt based on visitor locale
- SEO support (`sitemap.xml`, `robots.txt`, structured data)
- Admin dashboard for no-code updates:
- Organized admin tabs/subpages (Overview, Site, Rooms, Media, Channels, Bookings)
  - Site details and content
  - Room details, pricing, amenities, active/inactive
  - Photo upload with automatic logo watermark
- Top hero slideshow image manager (add/remove/reorder)
- Landing page room slideshow driven by admin-uploaded photos
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
- `render.yaml` (always-on cloud deploy blueprint)

## Deploy With Docker

```bash
cp .env.example .env
# update secrets in .env

docker compose up -d --build
```

This starts:

- `app` (Node.js booking platform)
- `nginx` (reverse proxy on port 80)

## Free Deploy (Render + GitHub)

1. Push this repository to GitHub (main branch).
2. Open Render dashboard and click **New > Blueprint**.
3. Select this repo. Render will detect `render.yaml`.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` when asked.
5. Deploy.

After deploy:

- You get a permanent public URL ending in `.onrender.com`.
- Every `git push` to `main` auto-updates the live site.

Free tier note:

- On free tier, file storage is not persistent.
- Uploaded photos and local SQLite data can reset after restarts/redeploys.
- For full persistence later, switch to paid plan + disk.

### Keep Admin Updates On Free Tier (Git Sync Workflow)

Use this workflow whenever you update rooms/photos/content from admin and want it to stay after redeploy:

1. Make your changes in admin on your local project.
2. Export content snapshot:
   - `npm run content:export`
3. Commit changed files:
   - `data/content.snapshot.json`
   - `public/uploads/rooms/*`
   - `public/uploads/site/*`
4. Push to `main`.
5. Render auto-redeploys and restores those updates from Git.

### Connect Bomagawani.com

1. In Render service, open **Settings > Custom Domains**.
2. Add `bomagawani.com` and `www.bomagawani.com`.
3. In your domain DNS panel, point records to Render values shown there.
4. Wait for SSL to become active automatically.

## Environment Variables

```env
NODE_ENV=development
PORT=3000
TRUST_PROXY=0
COOKIE_SECURE=0
MAX_UPLOAD_SIZE_MB=25
DATA_DIR=./data
UPLOAD_ROOT_DIR=./public/uploads
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
