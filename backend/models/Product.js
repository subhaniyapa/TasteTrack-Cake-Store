import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, default: '' },
    sizes: [{ label: String, price: Number, _id: false }],
    flavours: [String],
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    minPrice: { type: Number, default: 0 }, 
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

export const lowestPrice = (sizes = []) => (sizes.length ? Math.min(...sizes.map((x) => x.price)) : 0);
