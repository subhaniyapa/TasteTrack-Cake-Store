import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { productSchema } from '../validators/schemas.js';
import Product, { lowestPrice } from '../models/Product.js';
import Review from '../models/Review.js';
import { wrap, httpError, protect, adminOnly } from '../middleware/auth.js';

const router = Router();


router.get(
  '/',
  wrap(async (req, res) => {
    const { category, search, featured, sort, minPrice, maxPrice } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 48);

    const q = { inStock: true };
    if (category) q.category = category;
    if (featured === 'true') q.featured = true;
    if (search) q.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (minPrice || maxPrice) {
      q.minPrice = {};
      if (Number.isFinite(Number(minPrice)) && minPrice !== '') q.minPrice.$gte = Number(minPrice);
      if (Number.isFinite(Number(maxPrice)) && maxPrice !== '') q.minPrice.$lte = Number(maxPrice);
    }

    const sorts = {
      newest: { createdAt: -1 },
      price_asc: { minPrice: 1 },
      price_desc: { minPrice: -1 },
      rating: { ratingAvg: -1, ratingCount: -1 },
    };

    const [items, total] = await Promise.all([
      Product.find(q)
        .populate('category', 'name')
        .sort(sorts[sort] || sorts.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(q),
    ]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  })
);

// READ list for admin 
router.get(
  '/admin/all',
  protect,
  adminOnly,
  wrap(async (req, res) => res.json(await Product.find().populate('category', 'name').sort({ createdAt: -1 })))
);

// READ one
router.get(
  '/:id',
  wrap(async (req, res) => {
    const p = await Product.findById(req.params.id).populate('category', 'name').catch(() => null);
    if (!p) throw httpError(404, 'Cake not found');
    res.json(p);
  })
);

// CREATE
router.post(
  '/',
  protect,
  adminOnly,
  validate(productSchema),
  wrap(async (req, res) => {
    const { ratingAvg, ratingCount, minPrice, ...body } = req.body; // calculated fields are ignored
    res.status(201).json(await Product.create({ ...body, minPrice: lowestPrice(body.sizes) }));
  })
);

// UPDATE
router.put(
  '/:id',
  protect,
  adminOnly,
  validate(productSchema),
  wrap(async (req, res) => {
    const { ratingAvg, ratingCount, minPrice, ...body } = req.body;
    const p = await Product.findByIdAndUpdate(req.params.id, { ...body, minPrice: lowestPrice(body.sizes) }, { new: true, runValidators: true });
    if (!p) throw httpError(404, 'Cake not found');
    res.json(p);
  })
);

// DELETE 
router.delete(
  '/:id',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ product: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
