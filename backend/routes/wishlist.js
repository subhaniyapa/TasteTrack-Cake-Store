import { Router } from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { wrap, httpError, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// READ
router.get('/ids', wrap(async (req, res) => {
  const u = await User.findById(req.user._id).select('wishlist');
  res.json(u.wishlist.map(String));
}));

// READ
router.get('/', wrap(async (req, res) => {
  const u = await User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'category', select: 'name' } });
  res.json(u.wishlist.filter((p) => p && p.inStock));
}));

// CREATE
router.post('/:productId', wrap(async (req, res) => {
  if (!(await Product.exists({ _id: req.params.productId }).catch(() => null))) throw httpError(404, 'Cake not found');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.productId } });
  res.status(201).json({ ok: true });
}));

// DELETE
router.delete('/:productId', wrap(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
  res.json({ ok: true });
}));

export default router;
