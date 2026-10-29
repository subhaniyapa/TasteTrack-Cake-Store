import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const nav = useNavigate();
  const formRef = useRef(null);
  const [payhere, setPayhere] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState({ deliveryFee: 0, freeDeliveryOver: null }); // from the server
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [couponMsg, setCouponMsg] = useState('');
  const [f, setF] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    deliveryDate: tomorrow(),
    deliveryNote: '',
    paymentMethod: 'cod',
  });

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const discount = coupon?.discount || 0;
  const afterDiscount = subtotal - discount;
  const fee = config.freeDeliveryOver && afterDiscount >= config.freeDeliveryOver ? 0 : config.deliveryFee;

  useEffect(() => {
    api('/config').then(setConfig).catch(() => {});
  }, []);

  const applyCoupon = async () => {
    setCouponMsg('');
    try {
      setCoupon(await api('/coupons/validate', { method: 'POST', body: { code: couponInput, subtotal } }));
    } catch (err) {
      setCoupon(null);
      setCouponMsg(err.message);
    }
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(''); setCouponMsg(''); };

  
  useEffect(() => {
    if (payhere && formRef.current) formRef.current.submit();
  }, [payhere]);

  if (!items.length && !payhere)
    return (
      <div className="container page">
        <h1>Checkout</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/shop" className="btn">Browse cakes</Link>
      </div>
    );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const order = await api('/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((i) => ({ productId: i.productId, size: i.size, flavour: i.flavour, message: i.message, qty: i.qty })),
          customer: { name: f.name, phone: f.phone, email: f.email, address: f.address, city: f.city },
          deliveryDate: f.deliveryDate,
          deliveryNote: f.deliveryNote,
          paymentMethod: f.paymentMethod,
          couponCode: coupon?.code,
        },
      });

      if (f.paymentMethod === 'payhere') {
        const data = await api('/payments/payhere/start', { method: 'POST', body: { orderId: order._id } });
        clear();
        setPayhere(data); 
      } else {
        clear();
        nav(`/order/${order._id}`);
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (payhere)
    return (
      <div className="container page">
        <p className="muted">Taking you to the secure payment page...</p>
        <form ref={formRef} method="post" action={payhere.action}>
          {Object.entries(payhere.fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <noscript><button className="btn">Continue to payment</button></noscript>
        </form>
      </div>
    );

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <form className="cart-layout" onSubmit={submit}>
        <div className="form">
          <h2>Delivery details</h2>
          <div className="two">
            <div className="field"><label htmlFor="name">Full name</label><input id="name" required value={f.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" required value={f.phone} onChange={set('phone')} placeholder="07X XXX XXXX" /></div>
          </div>
          <div className="field"><label htmlFor="email">Email (for your receipt)</label><input id="email" type="email" value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="address">Address</label><input id="address" required value={f.address} onChange={set('address')} /></div>
          <div className="two">
            <div className="field"><label htmlFor="city">City</label><input id="city" required value={f.city} onChange={set('city')} /></div>
            <div className="field"><label htmlFor="date">Delivery date</label><input id="date" type="date" required min={tomorrow()} value={f.deliveryDate} onChange={set('deliveryDate')} /></div>
          </div>
          <div className="field"><label htmlFor="note">Note for the baker or rider (optional)</label><textarea id="note" rows={2} value={f.deliveryNote} onChange={set('deliveryNote')} /></div>

          <h2>Payment</h2>
          <label className={'option' + (f.paymentMethod === 'cod' ? ' on' : '')}>
            <input type="radio" name="pay" checked={f.paymentMethod === 'cod'} onChange={() => setF({ ...f, paymentMethod: 'cod' })} />
            <span><strong>Cash on delivery</strong><br /><span className="muted">Pay the rider when your cake arrives.</span></span>
          </label>
          <label className={'option' + (f.paymentMethod === 'payhere' ? ' on' : '')}>
            <input type="radio" name="pay" checked={f.paymentMethod === 'payhere'} onChange={() => setF({ ...f, paymentMethod: 'payhere' })} />
            <span><strong>Pay online with PayHere</strong><br /><span className="muted">Visa, Mastercard, and local wallets. You will be redirected to a secure page.</span></span>
          </label>
          {error && <p className="error" role="alert">{error}</p>}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          {items.map((i, idx) => (
            <div className="line" key={idx}>
              <span>{i.qty} × {i.name} ({i.size})</span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <hr />
          {coupon ? (
            <p className="small-text good">Coupon applied. <button type="button" className="linklike" onClick={removeCoupon}>Remove</button></p>
          ) : (
            <>
              <div className="coupon-row">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
                <button type="button" className="btn ghost" onClick={applyCoupon} disabled={!couponInput.trim()}>Apply</button>
              </div>
              {couponMsg && <p className="error small-text" role="alert" style={{ marginTop: 8 }}>{couponMsg}</p>}
            </>
          )}
          <div className="line" style={{ marginTop: 12 }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {coupon && <div className="line good"><span>Coupon {coupon.code} ({coupon.description})</span><span>- {money(discount)}</span></div>}
          <div className="line"><span>Delivery</span><span>{fee ? money(fee) : 'Free'}</span></div>
          <div className="line total"><span>Total</span><span>{money(afterDiscount + fee)}</span></div>
          <button className="btn block" disabled={busy}>
            {busy ? 'Please wait...' : f.paymentMethod === 'payhere' ? 'Place order and pay' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
