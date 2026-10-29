import { money, downloadInvoice } from '../api.js';

export const STATUS = {
  placed: 'Order placed',
  preparing: 'Being baked',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const FLOW = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderCard({ order, onCancel, invoiceAuth }) {
  const idx = FLOW.indexOf(order.status);
  return (
    <div className="order-card">
      <div className="order-head">
        <div>
          <h3>{order.orderNo}</h3>
          <p className="muted">Delivery on {new Date(order.deliveryDate).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</p>
        </div>
        <div className="right">
          <span className={'pill ' + order.status}>{STATUS[order.status]}</span>
          <p className="muted small-text">
            {order.paymentMethod === 'cod' ? 'Cash on delivery' : `Online payment: ${order.paymentStatus}`}
          </p>
        </div>
      </div>

      {order.status !== 'cancelled' && (
        <ol className="progress" aria-label="Order progress">
          {FLOW.map((s, i) => (
            <li key={s} className={i <= idx ? 'done' : ''}>{STATUS[s]}</li>
          ))}
        </ol>
      )}

      {order.items.map((i, k) => (
        <div className="line" key={k}>
          <span>
            {i.qty} × {i.name} ({i.size}{i.flavour ? `, ${i.flavour}` : ''})
            {i.message && <em className="muted"> "{i.message}"</em>}
          </span>
          <span>{money(i.price * i.qty)}</span>
        </div>
      ))}
      <hr />
      {order.discount > 0 && <div className="line"><span>Coupon {order.couponCode}</span><span>- {money(order.discount)}</span></div>}
      <div className="line"><span>Delivery</span><span>{order.deliveryFee ? money(order.deliveryFee) : 'Free'}</span></div>
      <div className="line total"><span>Total</span><span>{money(order.total)}</span></div>
      <p className="muted small-text">{order.customer.address}, {order.customer.city}</p>
      {invoiceAuth && order.status !== 'cancelled' && (
        <button className="btn ghost small-btn" style={{ marginRight: 10 }} onClick={() => downloadInvoice(order, invoiceAuth).catch((e) => alert(e.message))}>Download invoice</button>
      )}
      {onCancel && order.status === 'placed' && (
        <button className="btn ghost small-btn" onClick={() => onCancel(order)}>Cancel order</button>
      )}
    </div>
  );
}
