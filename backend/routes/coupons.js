import { Router } from 'express';
import Coupon from '../models/Coupon.js';
import { applyCoupon } from '../utils/coupon.js';
import { wrap, httpError, protect, adminOnly } from '../middleware/auth.js';

const router = Router();


router.post(
  '/validate',
  wrap(async (req, res) => {
    const { coupon, discount } = await applyCoupon(req.body.code, Number(req.body.subtotal) || 0);
    res.json({ code: coupon.code, discount, description: coupon.type === 'percent' ? `${coupon.value}% off` : `Rs. ${coupon.value} off` });
  })
);

const clean = (b) => {
  const code = String(b.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) throw httpError(400, 'Code must be 3-20 letters, numbers, - or _');
  if (!['percent', 'fixed'].includes(b.type)) throw httpError(400, 'Choose percent or fixed amount');
  const value = Number(b.value);
  if (!(value >= 1)) throw httpError(400, 'Discount value must be at least 1');
  if (b.type === 'percent' && value > 100) throw httpError(400, 'Percent cannot be more than 100');
  return {
    code,
    type: b.type,
    value,
    minOrder: Math.max(Number(b.minOrder) || 0, 0),
    usageLimit: Math.max(parseInt(b.usageLimit) || 0, 0),
    expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
    active: b.active !== false,
  };
};

const dupe = (e) => {
  if (e.code === 11000) throw httpError(400, 'That coupon code already exists');
  throw e;
};

// Admin CRUD
router.get('/', protect, adminOnly, wrap(async (req, res) => res.json(await Coupon.find().sort({ createdAt: -1 }))));

router.post('/', protect, adminOnly, wrap(async (req, res) => {
  try {
    res.status(201).json(await Coupon.create(clean(req.body)));
  } catch (e) {
    dupe(e);
  }
}));

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  try {
    const c = await Coupon.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
    if (!c) throw httpError(404, 'Coupon not found');
    res.json(c);
  } catch (e) {
    dupe(e);
  }
}));

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default router;
