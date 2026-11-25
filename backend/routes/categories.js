import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { categorySchema } from '../validators/schemas.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { wrap, httpError, protect, adminOnly } from '../middleware/auth.js';

const router = Router();


router.get(
  '/',
  wrap(async (req, res) => {
    const cats = await Category.find().sort({ name: 1 }).lean();
    
    const info = await Product.aggregate([
      { $match: { inStock: true } },
      { $addFields: { hasImage: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$image', ''] } }, 0] }, 1, 0] } } },
      { $sort: { featured: -1, hasImage: -1, createdAt: -1 } },
      { $group: { _id: '$category', count: { $sum: 1 }, fromPrice: { $min: '$minPrice' }, cover: { $first: '$image' }, sample: { $first: '$name' } } },
    ]);
    const byCat = new Map(info.map((i) => [String(i._id), i]));
    res.json(
      cats.map((c) => {
        const i = byCat.get(String(c._id));
        return { ...c, count: i?.count || 0, fromPrice: i?.fromPrice || 0, cover: i?.cover || '', sample: i?.sample || '' };
      })
    );
  })
);
// CREATE
router.post(
  '/',
  protect,
  adminOnly,
  validate(categorySchema),
  wrap(async (req, res) => {
    const { name, description } = req.body;
    if (!name?.trim()) throw httpError(400, 'Category name is required');
    if (await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') })) throw httpError(400, 'This category already exists');
    res.status(201).json(await Category.create({ name, description }));
  })
);

// UPDATE
router.put(
  '/:id',
  protect,
  adminOnly,
  validate(categorySchema),
  wrap(async (req, res) => {
    const c = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description },
      { new: true, runValidators: true }
    );
    if (!c) throw httpError(404, 'Category not found');
    res.json(c);
  })
);

// DELETE (blocked while cakes still use it)
router.delete(
  '/:id',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const used = await Product.countDocuments({ category: req.params.id });
    if (used) throw httpError(400, `${used} cake(s) still use this category. Move or delete them first.`);
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
