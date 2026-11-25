import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import siteConfig from '../siteConfig.js';

export default function Footer() {
  const c = siteConfig;
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo small />
          <p className="muted">{c.tagline}. Baked to order and delivered to your door.</p>
        </div>

        <div>
          <h4>Shop</h4>
          <ul className="footer-list">
            <li><Link to="/shop">All cakes</Link></li>
            <li><Link to="/track">Track an order</Link></li>
            <li><Link to="/login">My account</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </div>

        {(c.phone || c.email || c.address || c.hours) && (
          <div>
            <h4>Get in touch</h4>
            <ul className="footer-list">
              {c.phone && <li><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></li>}
              {c.email && <li><a href={`mailto:${c.email}`}>{c.email}</a></li>}
              {c.address && <li>{c.address}</li>}
              {c.hours && <li>{c.hours}</li>}
              {c.instagram && <li><a href={c.instagram} target="_blank" rel="noreferrer">Instagram</a></li>}
              {c.facebook && <li><a href={c.facebook} target="_blank" rel="noreferrer">Facebook</a></li>}
            </ul>
          </div>
        )}
      </div>
      <p className="container muted copy">© {new Date().getFullYear()} {c.name}. All rights reserved.</p>
    </footer>
  );
}
