import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        size: String,
        flavour: String,
        message: String,
        price: Number,
        qty: Number,
        _id: false,
      },
    ],
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
    },
    deliveryDate: { type: Date, required: true },
    deliveryNote: String,
    paymentMethod: { type: String, enum: ['cod', 'payhere'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: {
      type: String,
      enum: ['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    itemsTotal: Number,
    couponCode: String,
    discount: { type: Number, default: 0 },
    deliveryFee: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
