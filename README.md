# VeloDrive — Car Rental & Sales (Australia)

Next.js 16 front end + Express/MongoDB API in one repo. Dark premium design with GSAP, Three.js and Lenis smooth scrolling. Default locale is **Australia (`/au`)**, with all prices in AUD including GST.

## Quick start

```bash
npm install
npm run dev        # starts Next.js (http://localhost:3000) + the API (http://localhost:5000) together
```

Open **http://localhost:3000**, which redirects to `/au`.

On first start the API automatically:
- inserts 16 demo cars (LandCruiser, Ranger Raptor, Tesla Model Y, Porsche 911 …)
- creates the admin account from `.env` → **admin@velodrive.com.au / Admin@12345** (admin panel at `/au/admin`)

Other scripts: `npm run dev:web`, `npm run dev:api`, `npm run seed` (wipe & re-insert demo cars), `npm run build`, `npm start`.

### Setup checklist
1. **MongoDB Atlas → Network Access**: add your IP, otherwise the API can't connect.
2. **`.env`** (copy from `.env.example`): `MONGO_URI`, a long random `JWT_SECRET`.
3. **Email (Nodemailer)**: leave `SMTP_USER` empty in development, and OTP codes and reset links are printed in the API terminal. For real email with Gmail, turn on 2-Step Verification, create an App Password, and set `SMTP_USER` / `SMTP_PASS`.

## How it fits together

```
browser ──► Next.js (app/)  ──/api/* rewrite──►  Express API (server/)  ──► MongoDB
```

- `next.config.mjs` rewrites `/api/*` to the Express server (`API_URL`, default `http://localhost:5000`). Requests stay same-origin, so the httpOnly JWT cookie works with no CORS setup.
- `proxy.js` (Next 16's replacement for `middleware.js`) redirects `/` to the default locale.
- Cache Components is on: browser-only values (dates, URL hash/query) are read through `lib/hooks.js`, and URL-driven UI sits inside `<Suspense>`.

## Features

| Area | What it does |
|---|---|
| Home | Preloader, Three.js 3D car that drives in (bloom, stars, speed lines, reacts to mouse/scroll), split-text reveals, scroll-velocity brand marquee, counters, pinned horizontal "why us", categories, scroll-linked steps, finance calculator, animated AU map, reviews, FAQ, newsletter |
| Fleet / Rent / Buy | Live filters (city, type, fuel, make, seats, price), search, sort, pagination, all kept in the URL so links are shareable |
| Car page | Gallery, specs, ANCAP, features, **live server quote** (long-hire discounts, extras, GST breakdown), double-booking protection, test drives, purchase enquiry modal, finance estimate |
| Auth | Register → 6-digit email OTP → verified; login, forgot/reset by emailed link, password-strength meter |
| My garage (`/au/account`) | Bookings (cancel), favourites, profile (state, licence), change password |
| Contact | General / Finance pre-approval / Trade-in / Corporate (ABN) |
| Admin (`/au/admin`) | KPIs and revenue, booking status, add/edit/delete cars, enquiries inbox, customers |

**Australia-specific:** AUD prices including GST, AU phone validation, states and territories, rego, ABN, e-Tag tolls, ANCAP, Privacy Act and Spam Act consent, Acknowledgement of Country, schema.org `AutoRental` JSON-LD.

**Security:** bcrypt (12 rounds), JWT in an httpOnly SameSite cookie, OTP and reset tokens stored hashed with expiry, OTP attempt limit, rate limits on auth and forms, Helmet, honeypot spam field, no email enumeration, admin role guard.

## Credits
- Hero 3D car: "Ferrari 458 Italia" by [vicent091036](https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), taken from the three.js examples (`public/models/ferrari.glb`).
- Draco decoder (`public/draco/`) from three.js (MIT).

## i18n
Locales: `au` (default), `en`, `nz`, `fr`, `es`, `de`. Every locale is layered on top of English (`lib/i18n/get-dictionary.js`). New sections live in `dictionaries/extra-en.js` and show in English until translated.

## Structure

```
app/[locale]/        pages: home, rent, sales, fleet, fleet/[id], contact, login, register, forgot, reset, account, admin
components/          home/, fleet/, vehicle/, auth/, account/, admin/, layout/, shared/, providers/
lib/                 api.js (fetch helper), format.js, hooks.js, i18n/
server/              Express API: index.js, models/, routes/, middleware/, utils/ (mailer, pricing), seed/
proxy.js             locale redirect (Next 16)
```

## Before going live
- Rotate the MongoDB password and set a strong `JWT_SECRET`.
- Replace the demo Unsplash photos, ABN, phone numbers and addresses with real ones.
- Deploy the API (Render, Railway, or AWS Sydney `ap-southeast-2`) and point `API_URL` and `CLIENT_URL` at it.
