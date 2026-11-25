# Deploying TastTrack

For a mini project demo, running everything on your own laptop (`npm run dev` in backend and frontend) is completely fine.
Deploy only if your lecturer asks for a live link. Check each service's current pricing and free limits before you start, they change.

## 1. Database: MongoDB Atlas
1. Create a cluster in MongoDB Atlas. If no free option is shown for your account, check the cheapest available plan and its monthly cap first.
2. Database Access: add a user with a simple password (letters and numbers only).
3. Network Access: allow `0.0.0.0/0` (Render/Railway IP addresses change).
4. Copy the connection string and add the database name: `...mongodb.net/tasttrack?retryWrites=true&w=majority`

## 2. Backend: Render, Railway or similar
- Root directory: `backend`, build command: `npm install`, start command: `npm start`
- Environment variables:

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas string |
| `JWT_SECRET` | a long random string |
| `CLIENT_URL` | your frontend address, e.g. `https://tasttrack.netlify.app` (no trailing slash) |
| `DELIVERY_FEE`, `FREE_DELIVERY_OVER` | as you like |
| `SMTP_*`, `MAIL_FROM` | optional, for emails |
| `PAYHERE_*` | optional, see below |

- Run `npm run seed` once (from your laptop with the Atlas string in `.env`) to create the admin user and sample cakes. Change the admin password afterwards.
- Photos uploaded in the admin panel are saved in `backend/uploads`. On most free hosting plans that disk is wiped on every restart, so photos disappear. Fix: attach a persistent disk, or move uploads to a service like Cloudinary (a good "future work" point for your report).

## 3. Frontend: Netlify or Vercel
- Root directory: `frontend`, build command: `npm run build`, publish directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend-address>/api`
- The `_redirects` (Netlify) and `vercel.json` (Vercel) files make page links like `/shop` work after a refresh.

## 4. PayHere live
- `PAYHERE_SANDBOX=false`, live Merchant ID and Secret, and `PAYHERE_NOTIFY_URL=https://<your-backend-address>/api/payments/payhere/notify`
- Register your real domain in the PayHere merchant settings.

## 5. Quick checklist
- [ ] Site opens and cakes load
- [ ] Register, log in, place a cash-on-delivery order
- [ ] Admin can see the order and change its status
- [ ] No `.env` file or password was pushed to GitHub
