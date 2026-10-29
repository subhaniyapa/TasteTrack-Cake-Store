import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Stars = ({ value }) => (
  <span className="stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= Math.round(value) ? 'on' : ''}>★</span>
    ))}
  </span>
);

export default function Reviews({ productId, onChange }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api(`/reviews/product/${productId}`).then(setReviews).catch(() => {});
  useEffect(() => { load(); }, [productId]);

  const mine = reviews.find((r) => r.user === user?._id);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api(`/reviews/${editingId}`, { method: 'PUT', token, body: form });
      else await api(`/reviews/product/${productId}`, { method: 'POST', token, body: form });
      setForm({ rating: 5, comment: '' });
      setEditingId(null);
      await load();
      onChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (r) => {
    setEditingId(r._id);
    setForm({ rating: r.rating, comment: r.comment });
  };

  const del = async (r) => {
    if (!confirm('Delete this review?')) return;
    await api(`/reviews/${r._id}`, { method: 'DELETE', token });
    await load();
    onChange?.();
  };

  return (
    <div>
      <h2>Reviews</h2>

      {user && (!mine || editingId) && (
        <form className="form review-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="rating">Your rating</label>
            <select id="rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="comment">Your review (optional)</label>
            <textarea id="comment" rows={3} maxLength={500} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            <button className="btn">{editingId ? 'Save review' : 'Post review'}</button>
            {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm({ rating: 5, comment: '' }); }}>Cancel</button>}
          </div>
        </form>
      )}
      {!user && <p className="muted"><Link to="/login">Log in</Link> to write a review.</p>}

      {reviews.length === 0 && <p className="muted">No reviews yet. Be the first to review this cake.</p>}
      {reviews.map((r) => (
        <div className="review" key={r._id}>
          <div className="review-head">
            <strong>{r.userName}</strong>
            <Stars value={r.rating} />
            <span className="muted small-text">{new Date(r.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</span>
          </div>
          {r.comment && <p>{r.comment}</p>}
          {user && r.user === user._id && <button className="linklike" onClick={() => edit(r)}>Edit</button>}
          {user && (r.user === user._id || user.isAdmin) && <button className="linklike danger" onClick={() => del(r)} style={{ marginLeft: 14 }}>Delete</button>}
        </div>
      ))}
    </div>
  );
}
