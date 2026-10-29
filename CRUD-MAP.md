# CRUD map (for viva)

Every entity, its operations, the API route, the backend file and where it appears in the UI.

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| **Cakes** | `POST /api/products` | `GET /api/products`, `/:id`, `/admin/all` | `PUT /api/products/:id` | `DELETE /api/products/:id` |
| **Categories** | `POST /api/categories` | `GET /api/categories` | `PUT /api/categories/:id` | `DELETE /api/categories/:id` (blocked if cakes use it) |
| **Orders** | `POST /api/orders` | `GET /api/orders` (admin), `/mine`, `/track`, `/:id` | `PATCH /:id/status` (admin), `PATCH /:id/cancel` (customer) | `DELETE /api/orders/:id` (admin) |
| **Users** | `POST /api/auth/register` | `GET /api/auth/me`, `GET /api/users` (admin) | `PUT /api/users/me`, `PUT /api/users/me/password`, `PATCH /api/users/:id` (role, admin) | `DELETE /api/users/me`, `DELETE /api/users/:id` (admin) |
| **Reviews** | `POST /api/reviews/product/:id` | `GET /api/reviews/product/:id` | `PUT /api/reviews/:id` (own) | `DELETE /api/reviews/:id` (own or admin) |
| **Coupons** | `POST /api/coupons` (admin) | `GET /api/coupons` (admin), `POST /api/coupons/validate` (customer preview) | `PUT /api/coupons/:id` | `DELETE /api/coupons/:id` |
| **Wishlist** | `POST /api/wishlist/:productId` | `GET /api/wishlist`, `GET /api/wishlist/ids` | (not needed) | `DELETE /api/wishlist/:productId` |
| **Photos** | `POST /api/upload` (admin, multer) | `GET /uploads/<file>` | replace by uploading again | "Remove photo" in cake form |

## Search, filter, sort and pagination
- Cakes: `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=newest|price_asc|price_desc|rating&page=&limit=` returns `{ items, total, page, pages }` (backend/routes/products.js, frontend/src/pages/Shop.jsx).
- Orders (admin): `GET /api/orders?q=&status=&payment=&page=&limit=` (backend/routes/orders.js, frontend/src/pages/admin/AdminOrders.jsx).
- Pagination uses `skip((page-1)*limit).limit(limit)` plus `countDocuments` for the total.

## Admin dashboard
- `GET /api/stats` (backend/routes/stats.js) uses MongoDB **aggregation** (`$match`, `$group`, `$unwind`, `$sort`, `$dateToString`) for daily revenue, top-selling cakes and status counts.
- Revenue counts orders that are not cancelled and are either cash on delivery or already paid.
- Charts are plain CSS bars (frontend/src/pages/admin/AdminDashboard.jsx), no chart library.

## Coupons
- Rules live in one place: `backend/utils/coupon.js` (active, not expired, usage limit, minimum order).
- The checkout "Apply" button only previews the discount. The server checks the coupon again when the order is placed, then increases `usedCount`.

## Validation and security (backend)
- **Joi schemas** in `backend/validators/schemas.js`, applied by `backend/middleware/validate.js`. Bad input gets a 400 with a readable message, unknown fields are stripped (nobody can add `isAdmin: true` when registering), and types are converted.
- **helmet** adds security headers. **express-rate-limit** slows down repeated login, register and forgot-password attempts.
- Passwords: bcrypt hashing. Login returns a JWT. Reset tokens are random, only their SHA-256 hash is stored, and they expire after 1 hour.
- Admin routes use `protect` + `adminOnly`. Order access: admin, the logged-in owner, or a guest who knows the order's phone number (`canAccess` in `routes/orders.js`).

## Email, invoice and password reset
- `backend/utils/mailer.js` (nodemailer) sends: order received, status changes, payment received, password reset. It never throws, so a mail problem cannot break an order. With no SMTP settings it only prints to the terminal. `MAIL_PREVIEW=true` gives a free fake inbox with preview links.
- `backend/utils/invoice.js` (pdfkit) builds the PDF for `GET /api/orders/:id/invoice`.
- Forgot password: `POST /api/auth/forgot` then `POST /api/auth/reset/:token` (pages `ForgotPassword.jsx`, `ResetPassword.jsx`).

## Tests
`cd backend && npm test` runs 9 tests (Node's built-in test runner) for coupon rules and input validation. They use a fake database, so MongoDB is not needed.

## Where the code is
- Backend routes: `backend/routes/*.js`, schemas: `backend/models/*.js`
- Auth + roles: `backend/middleware/auth.js` (`protect`, `optionalAuth`, `adminOnly`, JWT)
- Admin screens: `frontend/src/pages/admin/` (Orders, Cakes, Categories, Users)
- Customer screens: `frontend/src/pages/` (Profile, MyOrders, Track, ProductPage + `components/Reviews.jsx`)

## Rules worth mentioning in the viva
- Prices are recalculated on the server, so the browser cannot change them.
- Passwords are hashed with bcrypt; login returns a JWT; admin routes check `isAdmin`.
- One review per customer per cake (unique index). Cake rating average is recalculated after every review change.
- A category cannot be deleted while cakes use it. An order can only be cancelled while its status is "placed".
- Upload accepts only JPG/PNG/WEBP up to 3 MB.
- PayHere payment status is only trusted after the server verifies PayHere's md5 signature.
