import test from 'node:test';
import assert from 'node:assert/strict';
import Coupon from '../models/Coupon.js';
import { applyCoupon } from '../utils/coupon.js';


const fake = (c) => { Coupon.findOne = async () => c; };
const base = { active: true, usedCount: 0, usageLimit: 0, minOrder: 0 };

test('percent coupon takes the right amount off', async () => {
  fake({ ...base, type: 'percent', value: 10, minOrder: 3000 });
  assert.equal((await applyCoupon('x', 5000)).discount, 500);
});

test('fixed coupon never discounts more than the subtotal', async () => {
  fake({ ...base, type: 'fixed', value: 500 });
  assert.equal((await applyCoupon('x', 300)).discount, 300);
});

test('minimum order is enforced', async () => {
  fake({ ...base, type: 'percent', value: 10, minOrder: 3000 });
  await assert.rejects(applyCoupon('x', 2000), /Spend at least/);
});

test('expired, used-up, switched-off and unknown coupons are rejected', async () => {
  fake({ ...base, type: 'fixed', value: 100, expiresAt: new Date(Date.now() - 1000) });
  await assert.rejects(applyCoupon('x', 5000), /expired/);
  fake({ ...base, type: 'fixed', value: 100, usageLimit: 2, usedCount: 2 });
  await assert.rejects(applyCoupon('x', 5000), /fully used/);
  fake({ ...base, type: 'fixed', value: 100, active: false });
  await assert.rejects(applyCoupon('x', 5000), /not valid/);
  fake(null);
  await assert.rejects(applyCoupon('x', 5000), /not valid/);
});
