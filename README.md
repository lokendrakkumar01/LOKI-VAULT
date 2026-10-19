# LOKI VAULT

A private personal library for photos, videos, PDFs and saved social links. The repository contains a Vite/React/Tailwind client and an Express/Mongoose API. Uploaded files go straight through the authenticated API to Cloudinary as `authenticated` assets; MongoDB stores metadata only. Private file URLs are minted after authentication and expire after 15 minutes. Sign-in cookies persist for 30 days, and the last visited section is remembered in that browser per account.

## Prerequisites

- Node.js 20 or newer and npm
- A MongoDB Atlas database and database user
- A Cloudinary account

## Local setup

1. Copy `.env.example` to `server/.env` and fill in `MONGODB_URI`, `CLOUDINARY_URL`, and a long random `JWT_SECRET`.
2. Set `CLIENT_ORIGIN=http://localhost:5173` and `COOKIE_SECURE=false` in `server/.env` for local development.
3. Install and start:

   ```sh
   npm install
   npm --prefix server install
   npm --prefix client install
   npm run dev
   ```

4. Visit `http://localhost:5173` and create an account. The API health check is at `http://localhost:4000/api/health`.

The root `.env.example` is a template only. Do not commit real `.env` files. Do not put MongoDB or Cloudinary secrets in any `VITE_*` variable; Vite variables are public in the built client.

## Install LOKI VAULT as an app

The client is a Progressive Web App. After the frontend is served over HTTPS, supported browsers can install it from the browser's install control; Chrome and Edge show an **Install LOKI VAULT** button when their install prompt is available. On iPhone/iPad, open the site in Safari, use **Share**, then **Add to Home Screen**. Android and desktop installations use the icons and standalone display settings in `client/public/manifest.webmanifest`.

The service worker caches the app shell and same-origin versioned frontend assets only. It explicitly skips `/api/` and upload paths; private API data, authentication responses, Cloudinary media and session tokens are never placed in the service-worker cache. Offline mode can open the app shell and shows an offline message, while private library actions require a network connection. No private writes are queued for later replay.

For a local production build, set `VITE_API_URL` in `client/.env` to the backend origin, then run `npm --prefix client install` and `npm --prefix client run build`. The deployable static app is written to `client/dist`; serve it over HTTPS for installation and service-worker support. Use `npm run dev` for local development.

The downloadable project source archive should include `client`, `server`, root configuration, lockfiles and this README. It must exclude `.git`, all `node_modules` directories, build caches and real `.env` files. `.env.example` contains placeholders only.

## Deploy to Render

Push this repository to GitHub, then create two Render services from the same repository.

### 1. API (Web Service)

- Runtime: **Node**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`
- Add environment variables:
  - `NODE_ENV=production`
  - `MONGODB_URI` — Atlas connection string, with the real database password entered in Render's dashboard.
  - `CLOUDINARY_URL` — `cloudinary://<api_key>:<api_secret>@<cloud_name>` entered only in Render's dashboard.
  - `JWT_SECRET` — long, unique random value.
  - `CLIENT_ORIGIN` — the exact deployed frontend origin, for example `https://loki-vault-web.onrender.com` (no trailing slash).
  - `COOKIE_SECURE=true`
  - `COOKIE_SAMESITE=none` — needed because the Render frontend and API use different `onrender.com` hostnames.

The API reads Render's `PORT` automatically. If you use a custom frontend domain, set `CLIENT_ORIGIN` to that origin and redeploy the API.

### 2. Frontend (Static Site)

- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Add build environment variable `VITE_API_URL=https://<your-api-service>.onrender.com` (no trailing slash).

After the first frontend deploy, copy its public origin into the API's `CLIENT_ORIGIN`, then redeploy the API. Both services must use HTTPS in production. The frontend sends session cookies with credentialed requests; keep the browser and API under the same site (Render's `onrender.com` domains or subdomains of your own domain) for reliable cookie behavior.

## MongoDB Atlas setup

Create a database user with a strong password and access limited to the vault database. In **Network Access**, permit the API host to reach the cluster. For a quick first deployment, Atlas can allow `0.0.0.0/0`; use a restricted IP range or private networking when available. Never put the database password in the frontend or repository. If the password has URL-reserved characters, percent-encode them in the connection string.

## Cloudinary setup

Set `CLOUDINARY_URL` only on the API service. The API uploads media using Cloudinary's authenticated delivery type and issues time-limited URLs only after checking the signed-in owner. Current upload limits are 100 MB per file and 8 files per request; accepted formats are JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV and PDF. Keep Cloudinary API secrets private and rotate them if they have been shared.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/assets`, `POST /api/assets/upload`, `PATCH /api/assets/:id`, `DELETE /api/assets/:id`, `POST /api/assets/:id/restore`
- `GET /api/collections`, `POST /api/collections`
- `GET /api/references`, `POST /api/references`, `PATCH /api/references/:id`, `DELETE /api/references/:id`
- `GET /api/health`

All library, collection and reference routes require the httpOnly session cookie. Accounts are private and have no sharing feature. Trash is a soft-delete area and files can be restored; permanent purge and password recovery are not implemented. Uploads show transfer progress and support drag-and-drop on desktop. Social links support custom platform names, automatic common-platform detection, categories, notes, tags, favorites, search, editing and deletion; they do not download third-party content.

## Release checklist

- [ ] Register, sign in, reload the page and sign out.
- [ ] Confirm two accounts cannot see each other's assets or collections.
- [ ] Upload supported image/video/PDF files and reject unsupported/oversized files.
- [ ] Confirm an authenticated file can be previewed and its temporary link expires.
- [ ] Favorite a file, move it to trash, and restore it.
- [ ] Add a collection and a social reference; confirm dashboard counts update.
- [ ] Add links from YouTube, Instagram, X, Pinterest, WhatsApp and a custom domain; verify platform detection, edit, favorite, delete, search, filters and pagination.
- [ ] Sign in, visit a different section, close/reopen the browser during the 30-day session, and confirm the account and last section are restored.
- [ ] Confirm production CORS origin, secure cookies, health check, and both deployed services.
- [ ] Confirm secrets exist only in Render environment settings and are absent from Git history.

This is a useful personal vault foundation, but before storing highly sensitive identity documents, add stronger session revocation, content-signature validation, permanent deletion/Cloudinary cleanup, and an independent security review.
