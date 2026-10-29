import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl, money } from '../api.js';
import siteConfig from '../siteConfig.js';
import CakeArt, { toneOf, variantOf } from '../components/CakeArt.jsx';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PERKS = [
  { icon: 'M12 3c2 3 5 4 5 8a5 5 0 0 1-10 0c0-4 3-5 5-8zM8 21h8', title: 'Baked to order', text: 'Made for your date, not taken off a shelf.' },
  { icon: 'M4 5h16v11H9l-5 4V5z', title: 'Your message on top', text: 'Add a few words and we write them on the cake.' },
  { icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.1M17 19a1.5 1.5 0 1 0 0-.1', title: 'Delivered on your day', text: 'Choose the delivery date at checkout.' },
  { icon: 'M3 7h18v10H3zM3 11h18M7 15h3', title: 'Pay your way', text: 'Card online or cash on delivery.' },
];

export default function Home() {
  const [cats, setCats] = useState([]);
  const [heroFailed, setHeroFailed] = useState(false); // true if the banner file cannot be loaded

  useEffect(() => {
    api('/categories').then(setCats).catch(() => {});
  }, []);

  const shown = cats.filter((c) => c.count > 0); // only categories that have cakes

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <p className="eyebrow">{siteConfig.tagline}</p>
            <h1>Cakes for the moments worth sharing.</h1>
            <p className="lead">Choose a cake, add your message and pick the day. We bake it fresh and bring it to your door.</p>
            <div className="row">
              <Link to="/shop" className="btn">Order a cake</Link>
              <Link to="/track" className="btn ghost">Track an order</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-art">
              {siteConfig.heroImage && !heroFailed ? (
                <img src={assetUrl(siteConfig.heroImage)} alt="Our cakes" onError={() => setHeroFailed(true)} />
              ) : (
                <CakeArt variant="layer" tone={0} />
              )}
            </div>
            
          </div>
        </div>
      </section>

      <section className="perks">
        <div className="container perks-grid">
          {PERKS.map((p) => (
            <div className="perk" key={p.title}>
              <span className="perk-icon"><Icon d={p.icon} /></span>
              <div><h3>{p.title}</h3><p className="muted">{p.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <h2>Shop by category</h2>
            <p className="muted">Choose a category to see all of its cakes.</p>
          </div>
          <Link to="/shop" className="muted-link">See all cakes</Link>
        </div>

        <div className="cat-grid">
          {shown.map((c) => (
            <Link key={c._id} to={`/shop?category=${c._id}`} className="cat-card">
              <div className="cat-img">
                {c.cover ? (
                  <img src={assetUrl(c.cover)} alt={c.sample || c.name} loading="lazy" />
                ) : (
                  <CakeArt variant={variantOf({ name: c.sample || c.name, category: { name: c.name } })} tone={toneOf(c.name)} />
                )}
              </div>
              <div className="cat-body">
                <div>
                  <h3>{c.name}</h3>
                  <p className="muted">{c.count} cake{c.count !== 1 && 's'}{c.fromPrice > 0 && <> · from {money(c.fromPrice)}</>}</p>
                </div>
                <span className="go">View all →</span>
              </div>
            </Link>
          ))}
        </div>
        {!shown.length && <p className="muted">No cakes yet. Add cakes in the Admin panel, or run <code>npm run seed</code> in the backend folder for sample cakes.</p>}
      </section>

      <section className="band">
        <div className="container">
          <h2 className="center">How it works</h2>
          <ol className="steps">
            <li><span className="step-no">1</span><h3>Choose</h3><p className="muted">Pick a cake, a size and a flavour.</p></li>
            <li><span className="step-no">2</span><h3>Personalise</h3><p className="muted">Add the message for the top of the cake.</p></li>
            <li><span className="step-no">3</span><h3>Pick a date</h3><p className="muted">Tell us when it should arrive.</p></li>
            <li><span className="step-no">4</span><h3>Enjoy</h3><p className="muted">We bake, deliver and you celebrate.</p></li>
          </ol>
        </div>
      </section>

      <section className="container section">
        <div className="cta">
          <div>
            <h2>Planning something bigger?</h2>
            <p className="muted">Weddings, parties and cakes made just for you. Get in touch and we will plan it together.</p>
          </div>
          <Link to="/contact" className="btn">Contact us</Link>
        </div>
      </section>
    </>
  );
}