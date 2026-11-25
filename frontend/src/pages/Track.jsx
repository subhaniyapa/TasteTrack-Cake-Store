import { useState } from 'react';
import { api } from '../api.js';
import OrderCard from '../components/OrderCard.jsx';

export default function Track() {
  const [orderNo, setOrderNo] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    try {
      setOrder(await api(`/orders/track?orderNo=${encodeURIComponent(orderNo)}&phone=${encodeURIComponent(phone)}`));
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (o) => {
    if (!confirm(`Cancel order ${o.orderNo}?`)) return;
    try {
      setOrder(await api(`/orders/${o._id}/cancel`, { method: 'PATCH', body: { phone } }));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container page narrow">
      <h1>Track your order</h1>
      <form className="form" onSubmit={submit}>
        <div className="two">
          <div className="field"><label htmlFor="no">Order number</label><input id="no" required value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="TT-123456" /></div>
          <div className="field"><label htmlFor="ph">Phone used for the order</label><input id="ph" required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <button className="btn">Track order</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {order && <OrderCard order={order} onCancel={cancel} invoiceAuth={{ phone }} />}
    </div>
  );
}
