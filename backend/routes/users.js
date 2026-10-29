import { Router } from 'express';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { profileSchema, passwordSchema } from '../validators/schemas.js';
import Review from '../models/Review.js';
import { recalcRating } from './reviews.js';
import { wrap, httpError, protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const safe = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, isAdmin: u.isAdmin });

async function removeUser(id) {
  const reviews = await Review.find({ user: id });
  await Review.deleteMany({ user: id });
  for (const pid of new Set(reviews.map((r) => String(r.product)))) await recalcRating(pid);
  await User.findByIdAndDelete(id);
}


// UPDATE profile
router.put(
  '/me',
  validate(profileSchema),
  wrap(async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim()) throw httpError(400, 'Name and email are required');
    const clash = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (clash) throw httpError(400, 'That email is used by another account');
    const u = await User.findByIdAndUpdate(req.user._id, { name, email, phone }, { new: true, runValidators: true });
    res.json(safe(u));
  })
);

// UPDATE password
router.put(
  '/me/password',
  validate(passwordSchema),
  wrap(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) throw httpError(400, 'New password must be at least 6 characters');
    const u = await User.findById(req.user._id);
    if (!(await u.matchPassword(currentPassword || ''))) throw httpError(400, 'Current password is wrong');
    u.password = newPassword; // hashed by the model's pre-save hook
    await u.save();
    res.json({ ok: true });
  })
);

// DELETE my account 
router.delete(
  '/me',
  wrap(async (req, res) => {
    const u = await User.findById(req.user._id);
    if (!(await u.matchPassword(req.body.password || ''))) throw httpError(400, 'Password is wrong');
    if (u.isAdmin && (await User.countDocuments({ isAdmin: true })) === 1) throw httpError(400, 'You are the only admin. Make someone else admin first.');
    await removeUser(u._id);
    res.json({ ok: true });
  })
);



// READ all users
router.get('/', adminOnly, wrap(async (req, res) => res.json(await User.find().select('-password').sort({ createdAt: -1 }))));

// UPDATE role
router.patch(
  '/:id',
  adminOnly,
  wrap(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) throw httpError(400, 'You cannot change your own role');
    const u = await User.findByIdAndUpdate(req.params.id, { isAdmin: !!req.body.isAdmin }, { new: true }).select('-password');
    if (!u) throw httpError(404, 'User not found');
    res.json(u);
  })
);

// DELETE user
router.delete(
  '/:id',
  adminOnly,
  wrap(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) throw httpError(400, 'Use "Delete my account" on your profile page');
    await removeUser(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
