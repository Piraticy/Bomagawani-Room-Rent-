# Deploying to Vercel

This app now runs on Vercel's serverless model. The code auto-detects its
environment via a couple of environment variables, so **local dev, Docker,
and Render all keep working exactly as before** — nothing changes for them.
Vercel is the only environment that needs the two extra services below,
because Vercel's filesystem is temporary and doesn't survive between
requests or deploys.

| What the app needs | Local dev / Docker / Render | Vercel |
|---|---|---|
| Database | Local SQLite file (`data/bomagawani.db`) | [Turso](https://turso.tech) — a hosted, SQLite-compatible database |
| Uploaded photos | Local disk (`public/uploads/`) | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Admin login sessions | Same SQLite database | Same Turso database |

Once this one-time setup is done, **every `git push` to `main` automatically
redeploys the live site** — that's Vercel's default behavior once a GitHub
repo is connected to a project, no extra steps needed after today.

## 1. Create a free Turso database

1. Go to [turso.tech](https://turso.tech) and sign up (free tier is plenty for this site).
2. Install the Turso CLI, or use their web dashboard, to create a database, e.g.:
   ```bash
   turso db create bomagawani
   ```
3. Get the connection URL and an auth token:
   ```bash
   turso db show bomagawani --url
   turso db tokens create bomagawani
   ```
4. Keep these two values handy — you'll paste them into Vercel in step 3:
   - `TURSO_DATABASE_URL` (looks like `libsql://bomagawani-yourname.turso.io`)
   - `TURSO_AUTH_TOKEN`

The first time the app connects to this empty database, it automatically
creates all tables and seeds the default rooms/content/admin account — same
as a fresh local install.

## 2. Create a Vercel Blob store

1. In your Vercel account, open (or create) the project for this repo.
2. Go to the project's **Storage** tab → **Create Database** → **Blob**.
3. Once created, Vercel automatically adds a `BLOB_READ_WRITE_TOKEN`
   environment variable to the project for you — you don't need to copy
   this one manually, just confirm it's there under **Settings → Environment Variables**.

## 3. Import the GitHub repo into Vercel

1. In Vercel, click **Add New → Project** and import
   `Piraticy/Bomagawani-Room-Rent-` from GitHub.
2. Framework preset: leave as **Other** (this isn't a frontend framework
   project — `vercel.json` already routes everything to the Express app).
3. Before the first deploy, open **Settings → Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | from step 1 |
   | `TURSO_AUTH_TOKEN` | from step 1 |
   | `SESSION_SECRET` | a long random string, e.g. output of `openssl rand -hex 32` |
   | `ADMIN_EMAIL` | the email you want to log into `/admin` with |
   | `ADMIN_PASSWORD` | the password for that admin account (only used the very first time the database is created) |
   | `NODE_ENV` | `production` |
   | `COOKIE_SECURE` | `1` (Vercel serves everything over HTTPS) |

   Optional, only if you want booking-status emails to send:
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.

   `BLOB_READ_WRITE_TOKEN` should already be there from step 2.

4. Under **Settings → General**, confirm the Node.js version is **20.x**
   or newer (required by the image-processing library).
5. Click **Deploy**.

## 4. After the first deploy

- Visit your new `*.vercel.app` URL — the homepage, rooms, booking flow,
  and admin panel should all work exactly like the local/Docker version.
- Log into `/admin` with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set above.
- Try uploading a room photo or hero image from the admin panel — it should
  now be stored in Vercel Blob (you'll see it listed in the project's
  Storage tab) instead of on local disk.
- If you have a custom domain, add it under **Settings → Domains** as usual.

## Notes

- The **first deploy** seeds a brand-new database (default rooms, default
  content, one admin account). If you'd rather start from the same content
  already live on your Docker/Render deployment, ask for the content
  snapshot to be re-exported and reviewed before that first deploy, since a
  fresh database always starts from the version committed in
  `data/content.snapshot.json`.
- Local dev and Docker are completely unaffected: as long as
  `TURSO_DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` stay unset there (the
  default), they keep using the local SQLite file and local disk uploads
  exactly like before this change.
- Uploaded "original" backup copies (the unwatermarked source images, kept
  privately in local-disk mode) are intentionally **not** stored when using
  Vercel Blob, since Blob URLs aren't private/hidden the way the local
  `/uploads/originals` path is blocked from public access. Only the
  watermarked, public-facing image is stored in Blob.
