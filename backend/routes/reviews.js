import { Router } from 'express';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/schemas.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { wrap, httpError, protect } from '../middleware/auth.js';

const router = Router();


export async function recalcRating(productId) {
  const [r] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingAvg: r ? Math.round(r.avg * 10) / 10 : 0,
    ratingCount: r ? r.n : 0,
  });
}

const checkBody = ({ rating, comment }) => {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw httpError(400, 'Rating must be between 1 and 5');
  if ((comment || '').length > 500) throw httpError(400, 'Comment is too long (max 500 characters)');
  return { rating: n, comment: (comment || '').trim() };
};


router.get(
  '/product/:productId',
  wrap(async (req, res) => res.json(await Review.find({ product: req.params.productId }).sort({ createdAt: -1 })))
);

// CREATE 
router.post(
  '/product/:productId',
  protect,
  validate(reviewSchema),
  wrap(async (req, res) => {
    if (!(await Product.exists({ _id: req.params.productId }))) throw httpError(404, 'Cake not found');
    const data = checkBody(req.body);
    try {
      const review = await Review.create({ ...data, product: req.params.productId, user: req.user._id, userName: req.user.name });
      await recalcRating(req.params.productId);
      res.status(201).json(review);
    } catch (e) {
      if (e.code === 11000) throw httpError(400, 'You have already reviewed this cake. You can edit your review instead.');
      throw e;
    }
  })
);

// UPDATE 
router.put(
  '/:id',
  protect,
  validate(reviewSchema),
  wrap(async (req, res) => {
    const review = await Review.findById(req.params.id).catch(() => null);
    if (!review) throw httpError(404, 'Review not found');
    if (String(review.user) !== String(req.user._id)) throw httpError(403, 'You can only edit your own review');
    Object.assign(review, checkBody(req.body));
    await review.save();
    await recalcRating(review.product);
    res.json(review);
  })
);

// DELETE 
router.delete(
  '/:id',
  protect,
  wrap(async (req, res) => {
    const review = await Review.findById(req.params.id).catch(() => null);
    if (!review) throw httpError(404, 'Review not found');
    if (String(review.user) !== String(req.user._id) && !req.user.isAdmin) throw httpError(403, 'Not allowed');
    await review.deleteOne();
    await recalcRating(review.product);
    res.json({ ok: true });
  })
);

export default router;
