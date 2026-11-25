import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminCoupons from './admin/AdminCoupons.jsx';
import AdminOrders from './admin/AdminOrders.jsx';
import AdminCakes from './admin/AdminCakes.jsx';
import AdminCategories from './admin/AdminCategories.jsx';
import AdminUsers from './admin/AdminUsers.jsx';

const TABS = [
  ['dashboard', 'Dashboard', AdminDashboard],
  ['orders', 'Orders', AdminOrders],
  ['cakes', 'Cakes', AdminCakes],
  ['categories', 'Categories', AdminCategories],
  ['coupons', 'Coupons', AdminCoupons],
  ['users', 'Users', AdminUsers],
];

export default function Admin() {
  const { token } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const Panel = TABS.find((t) => t[0] === tab)[2];

  return (
    <div className="container page">
      <h1>Admin</h1>
      <div className="chips" style={{ marginBottom: 20 }}>
        {TABS.map(([key, label]) => (
          <button key={key} className={'chip' + (tab === key ? ' on' : '')} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      <Panel token={token} />
    </div>
  );
}
