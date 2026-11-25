import { Router } from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { wrap, protect, adminOnly } from '../middleware/auth.js';

const router = Router();
const TZ = 'Asia/Colombo';


const counted = { status: { $ne: 'cancelled' }, $or: [{ paymentMethod: 'cod' }, { paymentStatus: 'paid' }] };

const dayString = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toLocaleDateString('en-CA', { timeZone: TZ });

router.get(
  '/',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const since = new Date(Date.now() - 35 * 864e5);

    const [daily, statusRows, topCakes, customers, cakes, recent] = await Promise.all([
      Order.aggregate([
        { $match: { ...counted, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
      ]),
      Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: counted },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
      User.countDocuments({ isAdmin: false }),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const byDay = new Map(daily.map((d) => [d._id, d]));

    
    const series = [];
    for (let i = 13; i >= 0; i--) {
      const date = dayString(i);
      series.push({ date, orders: byDay.get(date)?.orders || 0, revenue: byDay.get(date)?.revenue || 0 });
    }

    const today = dayString(0);
    const monthPrefix = today.slice(0, 7);
    const monthRows = daily.filter((d) => d._id.startsWith(monthPrefix));
    const statusCounts = Object.fromEntries(statusRows.map((s) => [s._id, s.n]));

    res.json({
      today: { orders: byDay.get(today)?.orders || 0, revenue: byDay.get(today)?.revenue || 0 },
      month: {
        orders: monthRows.reduce((s, d) => s + d.orders, 0),
        revenue: monthRows.reduce((s, d) => s + d.revenue, 0),
      },
      toBake: (statusCounts.placed || 0) + (statusCounts.preparing || 0),
      customers,
      cakes,
      statusCounts,
      series,
      topCakes: topCakes.map((t) => ({ name: t._id, qty: t.qty, revenue: t.revenue })),
      recent,
    });
  })
);

export default router;
