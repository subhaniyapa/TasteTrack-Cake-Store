import { useEffect, useState } from 'react';
import { api, money, uploadImage, assetUrl } from '../../api.js';

const emptyForm = { name: '', category: '', description: '', image: '', sizesText: '1 kg: 4000', flavoursText: 'Vanilla', featured: false, inStock: true };

const toForm = (p) => ({
  ...p,
  category: p.category?._id || '',
  sizesText: p.sizes.map((s) => `${s.label}: ${s.price}`).join('\n'),
  flavoursText: p.flavours.join(', '),
});

const fromForm = (f) => ({
  name: f.name,
  category: f.category,
  description: f.description,
  image: f.image,
  featured: f.featured,
  inStock: f.inStock,
  flavours: f.flavoursText.split(',').map((s) => s.trim()).filter(Boolean),
  sizes: f.sizesText
    .split('\n')
    .map((l) => l.split(':'))
    .filter((p) => p.length === 2 && Number(p[1]))
    .map(([label, price]) => ({ label: label.trim(), price: Number(price) })),
});

export default function AdminCakes({ token }) {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => api('/products/admin/all', { token }).then(setProducts).catch(() => {});
  useEffect(() => {
    load();
    api('/categories').then(setCats).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pickFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      setForm((f) => ({ ...f }));
      const url = await uploadImage(file, token);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const body = fromForm(form);
    if (!body.category) return setError('Choose a category (add one in the Categories tab first)');
    if (!body.sizes.length) return setError('Add at least one size, like "1 kg: 4000"');
    try {
      await api(form._id ? `/products/${form._id}` : '/products', { method: form._id ? 'PUT' : 'POST', token, body });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api('/products/' + p._id, { method: 'DELETE', token });
    load();
  };

  if (form)
    return (
      <form className="form" onSubmit={save}>
        <h2>{form._id ? 'Edit cake' : 'Add cake'}</h2>
        <div className="two">
          <div className="field"><label htmlFor="a1">Name</label><input id="a1" required value={form.name} onChange={set('name')} /></div>
          <div className="field">
            <label htmlFor="a2">Category</label>
            <select id="a2" required value={form.category} onChange={set('category')}>
              <option value="">Choose...</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label htmlFor="a3">Description</label><textarea id="a3" rows={3} value={form.description} onChange={set('description')} /></div>

        <div className="field">
          <label htmlFor="a4">Photo</label>
          <div className="upload-row">
            {form.image && <img className="preview" src={assetUrl(form.image)} alt="Cake preview" />}
            <div>
              <input id="a4" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
              <p className="muted small-text">{uploading ? 'Uploading...' : 'JPG, PNG or WEBP, up to 3 MB.'}</p>
              <input type="text" className="photo-link" placeholder="...or paste a photo link, e.g. /cakes/fudge.jpg" value={form.image} onChange={set('image')} aria-label="Photo link" />
              {form.image && <button type="button" className="linklike" onClick={() => setForm({ ...form, image: '' })}>Remove photo</button>}
            </div>
          </div>
        </div>

        <div className="two">
          <div className="field"><label htmlFor="a5">Sizes and prices (one per line)</label><textarea id="a5" rows={4} value={form.sizesText} onChange={set('sizesText')} /></div>
          <div className="field"><label htmlFor="a6">Flavours (comma separated)</label><textarea id="a6" rows={4} value={form.flavoursText} onChange={set('flavoursText')} /></div>
        </div>
        <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show on home page</label>
        <label className="check"><input type="checkbox" checked={form.inStock} onChange={set('inStock')} /> Available to order</label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row"><button className="btn" disabled={uploading}>Save cake</button><button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button></div>
      </form>
    );

  return (
    <>
      <button className="btn" onClick={() => setForm(emptyForm)}>Add cake</button>
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead><tr><th>Cake</th><th>Category</th><th>Sizes</th><th>Rating</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category?.name}</td>
                <td className="small-text">{p.sizes.map((s) => `${s.label} ${money(s.price)}`).join(', ')}</td>
                <td>{p.ratingCount ? `${p.ratingAvg} (${p.ratingCount})` : '-'}</td>
                <td>{p.inStock ? 'Available' : 'Hidden'}</td>
                <td className="actions">
                  <button className="linklike" onClick={() => setForm(toForm(p))}>Edit</button>
                  <button className="linklike danger" onClick={() => del(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
