import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import Coupon from './models/Coupon.js';
import { lowestPrice } from './models/Product.js';

// Sample cake data 
const cakes = JSON.parse(fs.readFileSync(new URL('../database/seed-cakes.json', import.meta.url), 'utf8'));

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Order.deleteMany(), Review.deleteMany(), Coupon.deleteMany()]);

await User.create({ name: 'TastTrack Admin', email: 'admin@tasttrack.lk', password: 'Admin@123', isAdmin: true });

const names = [...new Set(cakes.map((c) => c.category))];
const cats = await Category.insertMany(names.map((name) => ({ name })));
const idByName = Object.fromEntries(cats.map((c) => [c.name, c._id]));

await Product.insertMany(cakes.map((c) => ({ ...c, category: idByName[c.category], minPrice: lowestPrice(c.sizes) })));
await Coupon.insertMany([
  { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 3000 },
  { code: 'CAKE500', type: 'fixed', value: 500, minOrder: 5000 },
]);
console.log('Seeded. Admin login: admin@tasttrack.lk / Admin@123');
await mongoose.disconnect();
