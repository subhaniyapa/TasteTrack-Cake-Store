import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { token } = useAuth();
  const { ids } = useWishlist();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (token) api('/wishlist', { token }).then(setItems).catch(() => setItems([]));
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  // when a heart is un-clicked the card disappears straight away
  const shown = items?.filter((p) => ids.includes(p._id));

  return (
    <div className="container page">
      <h1>My wishlist</h1>
      {shown === undefined ? <p className="muted">Loading...</p> : shown.length ? (
        <div className="grid">{shown.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      ) : (
        <>
          <p className="muted">You have not saved any cakes yet. Tap the heart on a cake to keep it here.</p>
          <Link to="/shop" className="btn">Browse cakes</Link>
        </>
      )}
    </div>
  );
}
