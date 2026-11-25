import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminCategories({ token }) {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/categories').then(setCats).catch(() => {});
  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ name: '', description: '' }); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(editingId ? `/categories/${editingId}` : '/categories', { method: editingId ? 'PUT' : 'POST', token, body: form });
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    setError('');
    try {
      await api('/categories/' + c._id, { method: 'DELETE', token });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form className="form box" onSubmit={save}>
        <h2>{editingId ? 'Edit category' : 'Add category'}</h2>
        <div className="two">
          <div className="field"><label htmlFor="c1">Name</label><input id="c1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="c2">Description (optional)</label><input id="c2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row"><button className="btn">{editingId ? 'Save category' : 'Add category'}</button>{editingId && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}</div>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.name}</strong></td>
                <td className="muted">{c.description}</td>
                <td className="actions">
                  <button className="linklike" onClick={() => { setEditingId(c._id); setForm({ name: c.name, description: c.description || '' }); }}>Edit</button>
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
