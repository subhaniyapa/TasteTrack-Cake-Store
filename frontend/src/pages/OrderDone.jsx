import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import OrderCard from '../components/OrderCard.jsx';

export default function OrderDone() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // After PayHere, the payment confirmation can arrive a few seconds later. Poll briefly.
  useEffect(() => {
    let tries = 0;
    let timer;
    const load = () =>
      api('/orders/' + id)
        .then((o) => {
          setOrder(o);
          if (o.paymentMethod === 'payhere' && o.paymentStatus === 'pending' && tries++ < 6) timer = setTimeout(load, 3000);
        })
        .catch((e) => setError(e.message));
    load();
    return () => clearTimeout(timer);
  }, [id]);

  const cancel = async (o) => {
    if (!confirm(`Cancel order ${o.orderNo}?`)) return;
    try {
      setOrder(await api(`/orders/${o._id}/cancel`, { method: 'PATCH', body: { phone: o.customer.phone } }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="container page"><p className="error">{error}</p></div>;
  if (!order) return <div className="container page"><p className="muted">Loading...</p></div>;

  return (
    <div className="container page narrow">
      <h1>Thank you, {order.customer.name.split(' ')[0]}.</h1>
      <p className="lead">Your order <strong>{order.orderNo}</strong> is in. Keep this number to track it.</p>
      {order.paymentMethod === 'payhere' && order.paymentStatus === 'pending' && (
        <p className="notice">We are waiting for PayHere to confirm your payment. This page will update.</p>
      )}
      {order.paymentMethod === 'payhere' && order.paymentStatus === 'failed' && (
        <p className="error">The payment did not go through. Contact us and we will help you complete the order.</p>
      )}
      <OrderCard order={order} onCancel={cancel} invoiceAuth={{ phone: order.customer.phone }} />
      <div className="row"><Link to="/shop" className="btn ghost">Order another cake</Link><Link to="/track" className="btn ghost">Track order</Link></div>
    </div>
  );
}
