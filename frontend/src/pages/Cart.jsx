import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';
import Cover from '../components/Cover.jsx';

export default function Cart() {
  const { items, setQty, remove, subtotal, keyOf } = useCart();
  const nav = useNavigate();

  if (!items.length)
    return (
      <div className="container page">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/shop" className="btn">Browse cakes</Link>
      </div>
    );

  return (
    <div className="container page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <div>
          {items.map((i) => {
            const k = keyOf(i);
            return (
              <div className="cart-item" key={k}>
                <div className="thumb"><Cover product={i} /></div>
                <div className="cart-info">
                  <h3>{i.name}</h3>
                  <p className="muted">{i.size}{i.flavour ? ` · ${i.flavour}` : ''}</p>
                  {i.message && <p className="muted">Message: "{i.message}"</p>}
                  <div className="qty small">
                    <button onClick={() => setQty(k, i.qty - 1)} aria-label="Decrease">-</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(k, i.qty + 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="cart-right">
                  <p className="price">{money(i.price * i.qty)}</p>
                  <button className="linklike" onClick={() => remove(k)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <aside className="summary">
          <h3>Summary</h3>
          <div className="line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <p className="muted small-text">Delivery fee is added at checkout.</p>
          <button className="btn block" onClick={() => nav('/checkout')}>Checkout</button>
        </aside>
      </div>
    </div>
  );
}
