import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';
import { STATUS } from '../../components/OrderCard.jsx';

const Card = ({ label, value, note }) => (
  <div className="stat">
    <p className="muted small-text">{label}</p>
    <p className="stat-value">{value}</p>
    {note && <p className="muted small-text">{note}</p>}
  </div>
);

export default function AdminDashboard({ token }) {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/stats', { token }).then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="muted">Loading dashboard...</p>;

  const max = Math.max(...s.series.map((d) => d.revenue), 1);
  const totalOrders = Object.values(s.statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <div className="stats">
        <Card label="Today's orders" value={s.today.orders} note={money(s.today.revenue)} />
        <Card label="This month" value={money(s.month.revenue)} note={`${s.month.orders} orders`} />
        <Card label="To bake / deliver" value={s.toBake} note="placed or being baked" />
        <Card label="Customers" value={s.customers} note={`${s.cakes} cakes in the shop`} />
      </div>

      <div className="dash-grid">
        <section className="box">
          <h2>Revenue, last 14 days</h2>
          <div className="bars" role="img" aria-label="Bar chart of daily revenue for the last 14 days">
            {s.series.map((d) => (
              <div className="bar-col" key={d.date} title={`${d.date}: ${money(d.revenue)} (${d.orders} orders)`}>
                <div className="bar" style={{ height: `${(d.revenue / max) * 100}%` }} />
                <span className="bar-label">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="muted small-text">Counts orders that are not cancelled and are cash on delivery or already paid.</p>
        </section>

        <section className="box">
          <h2>Orders by status</h2>
          {Object.entries(STATUS).map(([key, label]) => {
            const n = s.statusCounts[key] || 0;
            return (
              <div className="hbar" key={key}>
                <div className="line"><span>{label}</span><span>{n}</span></div>
                <div className="track"><div className={'fill ' + key} style={{ width: `${(n / totalOrders) * 100}%` }} /></div>
              </div>
            );
          })}
        </section>
      </div>

      <div className="dash-grid">
        <section className="box">
          <h2>Top selling cakes</h2>
          {s.topCakes.length ? (
            <ol className="top-list">
              {s.topCakes.map((t) => (
                <li key={t.name}><span>{t.name}</span><span className="muted">{t.qty} sold · {money(t.revenue)}</span></li>
              ))}
            </ol>
          ) : <p className="muted">No sales yet.</p>}
        </section>

        <section className="box">
          <h2>Latest orders</h2>
          {s.recent.length ? s.recent.map((o) => (
            <div className="line" key={o._id}>
              <span><strong>{o.orderNo}</strong> <span className="muted">{o.customer.name}</span></span>
              <span>{money(o.total)}</span>
            </div>
          )) : <p className="muted">No orders yet.</p>}
        </section>
      </div>
    </>
  );
}
