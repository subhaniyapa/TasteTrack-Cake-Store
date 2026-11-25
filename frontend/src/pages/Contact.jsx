import { Link } from 'react-router-dom';
import siteConfig from '../siteConfig.js';

export default function Contact() {
  const c = siteConfig;
  const hasDetails = c.phone || c.whatsapp || c.email || c.address || c.hours;

  return (
    <div className="container page narrow">
      <h1>Contact us</h1>
      <p className="lead">Planning a wedding, a big celebration or a cake that is not on our list? Tell us what you have in mind and we will help.</p>

      {hasDetails ? (
        <div className="contact-grid">
          {c.phone && <div className="box"><h3>Call us</h3><p><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></p></div>}
          {c.whatsapp && <div className="box"><h3>WhatsApp</h3><p><a className="btn" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer">Chat with us</a></p></div>}
          {c.email && <div className="box"><h3>Email</h3><p><a href={`mailto:${c.email}`}>{c.email}</a></p></div>}
          {c.address && <div className="box"><h3>Visit</h3><p>{c.address}</p></div>}
          {c.hours && <div className="box"><h3>Opening hours</h3><p>{c.hours}</p></div>}
        </div>
      ) : (
        <p className="notice">Contact details have not been added yet. The shop owner can add them in <code>frontend/src/siteConfig.js</code>.</p>
      )}

      <p style={{ marginTop: 28 }}><Link to="/shop" className="btn ghost">Browse cakes</Link></p>
    </div>
  );
}
