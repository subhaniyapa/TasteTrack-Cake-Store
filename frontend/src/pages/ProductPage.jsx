import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import Cover from '../components/Cover.jsx';
import HeartButton from '../components/HeartButton.jsx';
import Reviews, { Stars } from '../components/Reviews.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [size, setSize] = useState('');
  const [flavour, setFlavour] = useState('');
  const [message, setMessage] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api('/products/' + id)
      .then((d) => {
        setP(d);
        setSize(d.sizes[0]?.label || '');
        setFlavour(d.flavours[0] || '');
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container page"><p className="error">{error}</p></div>;
  if (!p) return <div className="container page"><p className="muted">Loading...</p></div>;

  const price = p.sizes.find((s) => s.label === size)?.price || 0;

  const addToCart = (goCart) => {
    add({ productId: p._id, name: p.name, image: p.image, size, flavour, message: message.trim(), price, qty });
    if (goCart) nav('/cart');
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="container page product">
      <div className="product-img"><Cover product={p} /></div>
      <div className="product-info">
        <p className="muted">{p.category?.name}</p>
        <h1>{p.name}</h1>
        {p.ratingCount > 0 && <p className="rating-line"><Stars value={p.ratingAvg} /> <span className="muted">{p.ratingAvg} from {p.ratingCount} review{p.ratingCount > 1 ? 's' : ''}</span></p>}
        <p className="price big">{money(price)}</p>
        <p>{p.description}</p>

        <div className="field">
          <label>Size</label>
          <div className="chips">
            {p.sizes.map((s) => (
              <button key={s.label} type="button" className={'chip' + (size === s.label ? ' on' : '')} onClick={() => setSize(s.label)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {p.flavours.length > 1 && (
          <div className="field">
            <label htmlFor="flavour">Flavour</label>
            <select id="flavour" value={flavour} onChange={(e) => setFlavour(e.target.value)}>
              {p.flavours.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="msg">Message on the cake (optional)</label>
          <input id="msg" maxLength={60} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy Birthday Nimali" />
        </div>

        <div className="field">
          <label htmlFor="qty">Quantity</label>
          <div className="qty">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">-</button>
            <span id="qty">{qty}</span>
            <button type="button" onClick={() => setQty(Math.min(20, qty + 1))} aria-label="Increase">+</button>
          </div>
        </div>

        <div className="row">
          <button className="btn" onClick={() => addToCart(false)}>{added ? 'Added to cart' : 'Add to cart'}</button>
          <button className="btn ghost" onClick={() => addToCart(true)}>Buy now</button>
          <HeartButton productId={p._id} label className="heart-inline" />
        </div>
      </div>
      <section className="reviews-wrap">
        <Reviews productId={p._id} onChange={() => api('/products/' + id).then(setP)} />
      </section>
    </div>
  );
}
