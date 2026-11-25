import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const httpError = (status, message) => Object.assign(new Error(message), { status });

async function userFromHeader(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    return await User.findById(id).select('-password');
  } catch {
    return null;
  }
}

export const protect = wrap(async (req, res, next) => {
  const user = await userFromHeader(req);
  if (!user) throw httpError(401, 'Please log in');
  req.user = user;
  next();
});

export const optionalAuth = wrap(async (req, res, next) => {
  req.user = await userFromHeader(req);
  next();
});

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return next(httpError(403, 'Admins only'));
  next();
};

export const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
