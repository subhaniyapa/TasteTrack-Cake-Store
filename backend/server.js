import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import categoryRoutes from './routes/categories.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import couponRoutes from './routes/coupons.js';
import statsRoutes from './routes/stats.js';
import wishlistRoutes from './routes/wishlist.js';
import uploadRoutes, { uploadDir } from './routes/upload.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
if (isProd) app.set('trust proxy', 1);


app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL }));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.get('/api/config', (req, res) =>
  res.json({
    deliveryFee: Number(process.env.DELIVERY_FEE || 0),
    freeDeliveryOver: Number(process.env.FREE_DELIVERY_OVER || 0) || null,
  })
);
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(uploadDir));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') err.status = 400;
  if (err.code === 'LIMIT_FILE_SIZE') Object.assign(err, { status: 400, message: 'Image is too large (max 3 MB)' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('Could not connect to MongoDB:', e.message);
    process.exit(1);
  });
