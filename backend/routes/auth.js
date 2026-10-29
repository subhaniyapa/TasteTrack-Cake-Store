import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotSchema, resetSchema } from '../validators/schemas.js';
import { sendMail } from '../utils/mailer.js';
import { passwordResetEmail } from '../utils/emails.js';
import { wrap, httpError, protect, signToken } from '../middleware/auth.js';

const router = Router();

const payload = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  isAdmin: u.isAdmin,
  token: signToken(u._id),
});

router.post(
  '/register',
  validate(registerSchema),
  wrap(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
    if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    if (await User.findOne({ email: email.toLowerCase() })) throw httpError(400, 'This email is already registered');
    const user = await User.create({ name, email, phone, password });
    res.status(201).json(payload(user));
  })
);

router.post(
  '/login',
  validate(loginSchema),
  wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(password || ''))) throw httpError(401, 'Wrong email or password');
    res.json(payload(user));
  })
);

const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');


router.post(
  '/forgot',
  validate(forgotSchema),
  wrap(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = sha(token);
      user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      sendMail(passwordResetEmail(user, `${process.env.CLIENT_URL}/reset-password/${token}`)); // not awaited on purpose
    }
    res.json({ message: 'If that email is registered, we have sent a reset link.' });
  })
);

router.post(
  '/reset/:token',
  validate(resetSchema),
  wrap(async (req, res) => {
    const user = await User.findOne({ resetToken: sha(req.params.token), resetExpires: { $gt: new Date() } });
    if (!user) throw httpError(400, 'This reset link is invalid or has expired');
    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ message: 'Password changed. You can log in now.' });
  })
);

router.get('/me', protect, (req, res) => res.json(req.user));

export default router;
