import Coupon from '../models/Coupon.js';
import { httpError } from '../middleware/auth.js';


export async function applyCoupon(code, subtotal) {
  const c = await Coupon.findOne({ code: String(code || '').trim().toUpperCase() });
  if (!c || !c.active) throw httpError(400, 'This coupon code is not valid');
  if (c.expiresAt && c.expiresAt < new Date()) throw httpError(400, 'This coupon has expired');
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) throw httpError(400, 'This coupon has been fully used');
  if (subtotal < c.minOrder) throw httpError(400, `Spend at least Rs. ${c.minOrder.toLocaleString('en-LK')} to use this coupon`);

  const raw = c.type === 'percent' ? (subtotal * c.value) / 100 : c.value;
  const discount = Math.min(Math.round(raw), subtotal);
  return { coupon: c, discount };
}
