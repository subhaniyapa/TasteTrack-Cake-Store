import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { validate } from '../middleware/validate.js';
import { orderSchema } from '../validators/schemas.js';
import { sendMail } from '../utils/mailer.js';
import { orderPlacedEmail, orderStatusEmail } from '../utils/emails.js';
import { streamInvoice } from '../utils/invoice.js';
import Coupon from '../models/Coupon.js';
import { applyCoupon } from '../utils/coupon.js';
import { wrap, httpError, protect, optionalAuth, adminOnly } from '../middleware/auth.js';

const router = Router();

const makeOrderNo = () => 'TT-' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 90);

// Create order
router.post(
  '/',
  optionalAuth,
  validate(orderSchema),
  wrap(async (req, res) => {
    const { items, customer, deliveryDate, deliveryNote, paymentMethod } = req.body;
    if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty');
    if (!['cod', 'payhere'].includes(paymentMethod)) throw httpError(400, 'Choose a payment method');
    const c = customer || {};
    if (!c.name || !c.phone || !c.address || !c.city) throw httpError(400, 'Name, phone, address and city are required');
    if (!deliveryDate || new Date(deliveryDate) <= new Date()) throw httpError(400, 'Choose a delivery date in the future');

    const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const lines = items.map((i) => {
      const p = byId.get(String(i.productId));
      if (!p || !p.inStock) throw httpError(400, 'One of the cakes is no longer available');
      const size = p.sizes.find((s) => s.label === i.size);
      if (!size) throw httpError(400, `Invalid size for ${p.name}`);
      const qty = Math.min(Math.max(parseInt(i.qty) || 1, 1), 20);
      return {
        product: p._id,
        name: p.name,
        image: p.image,
        size: size.label,
        flavour: i.flavour || p.flavours[0] || '',
        message: (i.message || '').slice(0, 60),
        price: size.price,
        qty,
      };
    });

    const itemsTotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

    
    let discount = 0;
    let coupon = null;
    if (req.body.couponCode) ({ coupon, discount } = await applyCoupon(req.body.couponCode, itemsTotal));

    const fee = Number(process.env.DELIVERY_FEE || 0);
    const freeOver = Number(process.env.FREE_DELIVERY_OVER || Infinity);
    const afterDiscount = itemsTotal - discount;
    const deliveryFee = afterDiscount >= freeOver ? 0 : fee;

    const order = await Order.create({
      orderNo: makeOrderNo(),
      user: req.user?._id,
      items: lines,
      customer: c,
      deliveryDate,
      deliveryNote,
      paymentMethod,
      itemsTotal,
      couponCode: coupon?.code,
      discount,
      deliveryFee,
      total: afterDiscount + deliveryFee,
    });
    if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
    if (order.customer.email) sendMail(orderPlacedEmail(order));
    res.status(201).json(order);
  })
);

router.get('/mine', protect, wrap(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));


router.get(
  '/track',
  wrap(async (req, res) => {
    const { orderNo, phone } = req.query;
    const o = await Order.findOne({ orderNo: (orderNo || '').trim().toUpperCase() });
    if (!o || o.customer.phone.replace(/\s/g, '') !== (phone || '').replace(/\s/g, '')) {
      throw httpError(404, 'No order found with those details');
    }
    res.json(o);
  })
);

const norm = (s = '') => s.replace(/\s/g, '');


const canAccess = (o, req, phone) =>
  !!req.user?.isAdmin ||
  !!(req.user && o.user && String(o.user) === String(req.user._id)) ||
  !!(phone && norm(phone) === norm(o.customer.phone));

// UPDATE
router.patch(
  '/:id/cancel',
  optionalAuth,
  wrap(async (req, res) => {
    const o = await Order.findById(req.params.id).catch(() => null);
    if (!o) throw httpError(404, 'Order not found');
    const isAdmin = !!req.user?.isAdmin;
    if (!canAccess(o, req, req.body.phone)) throw httpError(403, 'You cannot cancel this order');
    if (o.status !== 'placed') throw httpError(400, 'We have already started on this order, so it can no longer be cancelled');
    if (o.paymentStatus === 'paid' && !isAdmin) throw httpError(400, 'This order is already paid. Please contact us to cancel and arrange a refund.');
    o.status = 'cancelled';
    await o.save();
    if (o.customer.email) sendMail(orderStatusEmail(o));
    res.json(o);
  })
);


const escapeRx = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get(
  '/',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const { status, payment, q } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const f = {};
    if (status) f.status = status;
    if (payment) f.paymentStatus = payment;
    if (q?.trim()) {
      const rx = new RegExp(escapeRx(q.trim()), 'i');
      f.$or = [{ orderNo: rx }, { 'customer.name': rx }, { 'customer.phone': rx }];
    }

    const [items, total] = await Promise.all([
      Order.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(f),
    ]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  })
);

router.patch(
  '/:id/status',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const before = await Order.findById(req.params.id).catch(() => null);
    if (!before) throw httpError(404, 'Order not found');
    const o = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (status && status !== before.status && o.customer.email) sendMail(orderStatusEmail(o));
    res.json(o);
  })
);

// DELETE (admin only)
router.delete(
  '/:id',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

// PDF invoice
router.get(
  '/:id/invoice',
  optionalAuth,
  wrap(async (req, res) => {
    const o = await Order.findById(req.params.id).catch(() => null);
    if (!o) throw httpError(404, 'Order not found');
    if (!canAccess(o, req, req.query.phone)) throw httpError(403, 'You cannot download this invoice');
    streamInvoice(o, res);
  })
);

// Order confirmation page 
router.get(
  '/:id',
  wrap(async (req, res) => {
    const o = await Order.findById(req.params.id).catch(() => null);
    if (!o) throw httpError(404, 'Order not found');
    res.json(o);
  })
);

export default router;
