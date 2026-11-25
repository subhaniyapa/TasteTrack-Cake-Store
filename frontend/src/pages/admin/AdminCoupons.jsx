import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

const empty = { code: '', type: 'percent', value: 10, minOrder: 0, usageLimit: 0, expiresAt: '', active: true };

export default function AdminCoupons({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/coupons', { token }).then(setCoupons).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(editingId ? `/coupons/${editingId}` : '/coupons', { method: editingId ? 'PUT' : 'POST', token, body: form });
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await api('/coupons/' + c._id, { method: 'DELETE', token });
    load();
  };

  const expired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <>
      <form className="form box" onSubmit={save}>
        <h2>{editingId ? 'Edit coupon' : 'Add coupon'}</h2>
        <div className="two">
          <div className="field"><label htmlFor="k1">Code</label><input id="k1" required value={form.code} onChange={set('code')} placeholder="SAVE10" style={{ textTransform: 'uppercase' }} /></div>
          <div className="field">
            <label htmlFor="k2">Type</label>
            <select id="k2" value={form.type} onChange={set('type')}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off (Rs.)</option>
            </select>
          </div>
        </div>
        <div className="two">
          <div className="field"><label htmlFor="k3">{form.type === 'percent' ? 'Percent (1-100)' : 'Amount (Rs.)'}</label><input id="k3" type="number" min="1" required value={form.value} onChange={set('value')} /></div>
          <div className="field"><label htmlFor="k4">Minimum order (Rs.)</label><input id="k4" type="number" min="0" value={form.minOrder} onChange={set('minOrder')} /></div>
        </div>
        <div className="two">
          <div className="field"><label htmlFor="k5">Usage limit (0 = unlimited)</label><input id="k5" type="number" min="0" value={form.usageLimit} onChange={set('usageLimit')} /></div>
          <div className="field"><label htmlFor="k6">Expires on (optional)</label><input id="k6" type="date" value={form.expiresAt} onChange={set('expiresAt')} /></div>
        </div>
        <label className="check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Active</label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row"><button className="btn">{editingId ? 'Save coupon' : 'Add coupon'}</button>{editingId && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}</div>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Expires</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.type === 'percent' ? `${c.value}%` : money(c.value)}</td>
                <td>{c.minOrder ? money(c.minOrder) : '-'}</td>
                <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-LK') : 'Never'}</td>
                <td>{!c.active ? 'Off' : expired(c) ? 'Expired' : 'Active'}</td>
                <td className="actions">
                  <button className="linklike" onClick={() => edit(c)}>Edit</button>
                  <button className="linklike danger" onClick={() => del(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
