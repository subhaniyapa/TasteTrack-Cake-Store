import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import OrderCard from '../components/OrderCard.jsx';

export default function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (token) api('/orders/mine', { token }).then(setOrders).catch(() => setOrders([]));
  }, [token]);

  const cancel = async (o) => {
    if (!confirm(`Cancel order ${o.orderNo}?`)) return;
    try {
      const updated = await api(`/orders/${o._id}/cancel`, { method: 'PATCH', token });
      setOrders((list) => list.map((x) => (x._id === updated._id ? updated : x)));
    } catch (e) {
      alert(e.message);
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="container page narrow">
      <h1>My orders</h1>
      {orders === null ? <p className="muted">Loading...</p> : orders.length ? orders.map((o) => <OrderCard key={o._id} order={o} onCancel={cancel} invoiceAuth={{ token }} />) : (
        <>
          <p className="muted">You have not placed any orders yet.</p>
          <Link to="/shop" className="btn">Browse cakes</Link>
        </>
      )}
    </div>
  );
}
