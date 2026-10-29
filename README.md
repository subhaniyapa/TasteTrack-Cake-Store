# TastTrack - online cake store (MERN)

React (Vite) + Node/Express + MongoDB. Cart, checkout, Cash on Delivery, PayHere online payments, order tracking, admin panel.

## Folders
```
tasttrack/
  frontend/   React (Vite) website
  backend/    Node + Express API (models, routes, payments)
  database/   MongoDB setup (docker-compose) + sample cake data
```

## What's included
Cakes, categories, orders, users, reviews, coupons, wishlist and photo upload, all with CRUD. Admin dashboard with charts, search/filter/sort/pagination, coupon codes, PDF invoices, email notifications, forgot password, input validation, rate limiting and automated tests.
Illustrated cake pictures are shown until you add real photos (see `PHOTOS.md`). Shop details (phone, email, WhatsApp...) go in `frontend/src/siteConfig.js`.
See `CRUD-MAP.md` (for your viva) and `DEPLOY.md` (going live).

## Upgrading from an earlier version
1. Replace the old `backend`, `frontend` and `database` folders with the new ones (keep your own `backend/.env`).
2. `cd backend && npm install` (multer for photo upload), then `npm run seed` again. Seeding resets test data and adds sample coupons `WELCOME10` (10% off, min Rs. 3,000) and `CAKE500` (Rs. 500 off, min Rs. 5,000).
3. `cd frontend && npm install`

## Emails (optional)
Leave the `SMTP_*` settings empty and orders still work (emails are just printed in the terminal). To see emails without a real mail account, set `MAIL_PREVIEW=true` in `backend/.env`: the terminal prints a preview link for every email. For real emails, fill in `SMTP_*` (Gmail needs an App Password).

## Tests
`cd backend && npm test`

## 1. Requirements
- Node.js 18+
- MongoDB (easiest: `cd database && docker compose up -d`), or local install / Atlas. Default URI:  (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

## 2. Run the backend
```bash
cd backend
cp .env.example .env      # then edit .env (JWT_SECRET, MONGO_URI, PayHere keys)
npm install
npm run seed              # adds sample cakes + admin user
npm run dev               # http://localhost:5000
```
Admin login after seeding: `admin@tasttrack.lk` / `Admin@123` (change it!)

## 3. Run the frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## 4. PayHere setup
1. Create a PayHere account and a **Sandbox** merchant. Add `localhost` under Domains.
2. Put `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` in `backend/.env`.
3. PayHere's server must reach your notify URL, so expose the API: `ngrok http 5000`, then set
   `PAYHERE_NOTIFY_URL=https://<your-ngrok>/api/payments/payhere/notify`.
4. Test with PayHere sandbox cards. Payment status updates to "paid" when PayHere calls the notify URL.
5. For go-live: `PAYHERE_SANDBOX=false`, live merchant ID/secret, your real domain.

## 5. Go-live notes
- Build the client with `npm run build` and host `frontend/dist` (Netlify, Vercel, Nginx). Set `VITE_API_URL` to your API URL if hosted separately.
- Set `CLIENT_URL` in the server `.env` to your real site URL (used for CORS and PayHere return links).
- Add your own cake photos by pasting image URLs in Admin > Cakes.
