
import test from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../middleware/validate.js';
import { registerSchema, orderSchema, reviewSchema, productSchema } from '../validators/schemas.js';

const run = (schema, body) =>
  new Promise((resolve) => {
    const req = { body };
    validate(schema)(req, {}, (err) => resolve({ error: err?.message, body: req.body }));
  });

const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const goodOrder = {
  items: [{ productId: 'a'.repeat(24), size: '1 kg', flavour: 'Vanilla', message: 'Happy Birthday', qty: 1 }],
  customer: { name: 'Nimali Perera', phone: '0771234567', email: '', address: '12 Galle Road', city: 'Colombo' },
  deliveryDate: tomorrow,
  paymentMethod: 'cod',
};

test('register accepts good data and rejects a bad email or short password', async () => {
  assert.equal((await run(registerSchema, { name: 'Kasun', email: 'k@example.com', password: 'secret1' })).error, undefined);
  assert.match((await run(registerSchema, { name: 'Kasun', email: 'nope', password: 'secret1' })).error, /Email/);
  assert.match((await run(registerSchema, { name: 'Kasun', email: 'k@example.com', password: '123' })).error, /Password/);
});

test('unknown fields are stripped (nobody can sneak in isAdmin)', async () => {
  const { body } = await run(registerSchema, { name: 'Kasun', email: 'k@example.com', password: 'secret1', isAdmin: true });
  assert.equal(body.isAdmin, undefined);
});

test('order needs items, a valid phone and a future delivery date', async () => {
  assert.equal((await run(orderSchema, goodOrder)).error, undefined);
  assert.match((await run(orderSchema, { ...goodOrder, items: [] })).error, /Cart/);
  assert.match((await run(orderSchema, { ...goodOrder, customer: { ...goodOrder.customer, phone: 'abc' } })).error, /Phone/);
  assert.match((await run(orderSchema, { ...goodOrder, deliveryDate: '2020-01-01' })).error, /Delivery date/);
  assert.match((await run(orderSchema, { ...goodOrder, paymentMethod: 'bitcoin' })).error, /Payment method/);
});

test('review rating must be 1 to 5', async () => {
  assert.equal((await run(reviewSchema, { rating: 5, comment: 'Lovely' })).error, undefined);
  assert.match((await run(reviewSchema, { rating: 6 })).error, /Rating/);
});

test('cake needs at least one size with a positive price', async () => {
  const cake = { name: 'Test cake', category: 'b'.repeat(24), sizes: [{ label: '1 kg', price: 4000 }], flavours: ['Vanilla'] };
  assert.equal((await run(productSchema, cake)).error, undefined);
  assert.match((await run(productSchema, { ...cake, sizes: [] })).error, /Sizes/);
  assert.match((await run(productSchema, { ...cake, sizes: [{ label: '1 kg', price: -5 }] })).error, /Price/);
});

test('review rating rejects values outside the allowed range', async () => {
  assert.match((await run(reviewSchema, { rating: 0 })).error, /Rating/);
  assert.match((await run(reviewSchema, { rating: 6 })).error, /Rating/);
  assert.match((await run(reviewSchema, { rating: 4.5 })).error, /Rating/);
  assert.match((await run(reviewSchema, {})).error, /Rating/);
});

test('review comment must contain at least 3 characters when provided', async () => {
  assert.equal((await run(reviewSchema, { rating: 5, comment: '' })).error, undefined);
  assert.match((await run(reviewSchema, { rating: 5, comment: 'Hi' })).error, /Comment/);
  assert.equal((await run(reviewSchema, { rating: 5, comment: 'Good' })).error, undefined);
});
