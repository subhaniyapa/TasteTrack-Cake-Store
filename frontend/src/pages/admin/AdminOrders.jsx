import { useEffect, useState } from 'react';
import { api, money, downloadInvoice } from '../../api.js';
import { STATUS } from '../../components/OrderCard.jsx';
import Pagination from '../../components/Pagination.jsx';

export default function AdminOrders({ token }) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    const p = new URLSearchParams({ page, limit: 10 });
    if (q.trim()) p.set('q', q.trim());
    if (status) p.set('status', status);
    if (payment) p.set('payment', payment);
    return api('/orders?' + p, { token }).then(setData).catch(() => {});
  };

  
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, status, payment, page]);

  const filter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const update = async (id, body) => {
    await api(`/orders/${id}/status`, { method: 'PATCH', token, body });
    load();
  };

  const del = async (o) => {
    if (!confirm(`Delete order ${o.orderNo} permanently?`)) return;
    await api(`/orders/${o._id}`, { method: 'DELETE', token });
    load();
  };

  return (
    <>
      <div className="filters">
        <input type="search" placeholder="Search order no, name or phone" value={q} onChange={filter(setQ)} aria-label="Search orders" />
        <select value={status} onChange={filter(setStatus)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={payment} onChange={filter(setPayment)} aria-label="Filter by payment">
          <option value="">All payments</option>
          <option value="pending">Payment pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <p className="muted small-text">{data.total} order{data.total !== 1 && 's'}</p>

      {!data.items.length ? <p className="muted">No orders to show.</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Delivery</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o._id}>
                  <td><strong>{o.orderNo}</strong><br /><span className="muted small-text">{new Date(o.createdAt).toLocaleString('en-LK')}</span></td>
                  <td>{o.customer.name}<br /><span className="muted small-text">{o.customer.phone}<br />{o.customer.address}, {o.customer.city}</span></td>
                  <td>{new Date(o.deliveryDate).toLocaleDateString('en-LK')}</td>
                  <td>{o.items.map((i, k) => <div key={k} className="small-text">{i.qty} × {i.name} ({i.size}){i.message && <> "{i.message}"</>}</div>)}</td>
                  <td>{money(o.total)}{o.couponCode && <><br /><span className="muted small-text">{o.couponCode}</span></>}</td>
                  <td>
                    {o.paymentMethod === 'cod' ? 'COD' : 'PayHere'}
                    <select value={o.paymentStatus} onChange={(e) => update(o._id, { paymentStatus: e.target.value })}>
                      <option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option>
                    </select>
                  </td>
                  <td>
                    <select value={o.status} onChange={(e) => update(o._id, { status: e.target.value })}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="actions"><button className="linklike" onClick={() => downloadInvoice(o, { token }).catch((e) => alert(e.message))}>Invoice</button><button className="linklike danger" onClick={() => del(o)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>
  );
}
