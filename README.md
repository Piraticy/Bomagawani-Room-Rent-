# Bomagawani House Rent Platform

A complete booking platform for **Bomagawani.com** with:

- Professional mobile-friendly landing page
- Direct booking flow with booking code + receipt page
- Currency conversion (live rates with local fallback cache)
- Location route support (guest can use current location for map direction)
- Channel links (Booking.com, Tripadvisor, Google Travel, Book Direct)
- Admin portal to manage everything without code edits
- Room photo uploads with automatic **Bomagawani.com** watermark/logo caption
- Booking confirmation controls (confirmed dates become unavailable)
- Room, amenities, pricing, details, and hero content management

## Default Admin Login

- Email: `admin@bomagawani.com`
- Password: `Admin@12345`

Change these values in `.env` before production.

## Quick Start

```bash
npm install
npm start
```

Open:

- Public site: `http://localhost:3000`
- Admin portal: `http://localhost:3000/admin`

## Environment Variables

Create `.env` in the project root:

```env
PORT=3000
SESSION_SECRET=replace-with-long-random-secret
ADMIN_EMAIL=admin@bomagawani.com
ADMIN_PASSWORD=Admin@12345
```

## Main Business Flow

1. Guest visits landing page and checks room options.
2. Guest selects room + dates + currency and submits booking request.
3. Admin reviews booking in dashboard and confirms/cancels.
4. Once confirmed, selected dates are blocked instantly for that room.
5. Guest can track booking using booking code and open receipt page.

## Notes for Production Rollout

- Domain target is set as `Bomagawani.com` in site settings.
- Online payment can be integrated in next phase (Stripe/Flutterwave/PayPal).
- External booking channel APIs (Booking.com/Tripadvisor sync) require official partner credentials and can be connected as a follow-up integration.
