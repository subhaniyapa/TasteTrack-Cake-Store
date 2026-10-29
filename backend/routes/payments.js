import { Router } from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { sendMail } from '../utils/mailer.js';
import { paymentReceivedEmail } from '../utils/emails.js';
import { wrap, httpError } from '../middleware/auth.js';

const router = Router();
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex').toUpperCase();


router.post(
  '/payhere/start',
  wrap(async (req, res) => {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !secret) throw httpError(500, 'PayHere is not configured on the server');

    const order = await Order.findById(req.body.orderId).catch(() => null);
    if (!order || order.paymentMethod !== 'payhere') throw httpError(404, 'Order not found');
    if (order.paymentStatus === 'paid') throw httpError(400, 'This order is already paid');

    const amount = order.total.toFixed(2);
    const currency = 'LKR';
    const hash = md5(merchantId + order.orderNo + amount + currency + md5(secret));
    const [first, ...rest] = order.customer.name.split(' ');

    res.json({
      action:
        process.env.PAYHERE_SANDBOX === 'false'
          ? 'https://www.payhere.lk/pay/checkout'
          : 'https://sandbox.payhere.lk/pay/checkout',
      fields: {
        merchant_id: merchantId,
        return_url: `${process.env.CLIENT_URL}/order/${order._id}`,
        cancel_url: `${process.env.CLIENT_URL}/checkout`,
        notify_url: process.env.PAYHERE_NOTIFY_URL,
        order_id: order.orderNo,
        items: `TastTrack order ${order.orderNo}`,
        currency,
        amount,
        first_name: first,
        last_name: rest.join(' ') || '-',
        email: order.customer.email || 'noemail@tasttrack.lk',
        phone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        country: 'Sri Lanka',
        hash,
      },
    });
  })
);


router.post(
  '/payhere/notify',
  wrap(async (req, res) => {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    const local = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret));
    if (local !== (md5sig || '').toUpperCase()) return res.status(400).send('Bad signature');

    const order = await Order.findOne({ orderNo: order_id });
    if (!order) return res.status(404).send('No order');
    if (order.total.toFixed(2) !== Number(payhere_amount).toFixed(2)) return res.status(400).send('Amount mismatch');

    const code = Number(status_code);
    const wasPaid = order.paymentStatus === 'paid';
    if (code === 2) order.paymentStatus = 'paid';
    else if (code < 0) order.paymentStatus = 'failed';
    await order.save();
    if (!wasPaid && order.paymentStatus === 'paid' && order.customer.email) sendMail(paymentReceivedEmail(order));
    res.send('OK');
  })
);

export default router;
