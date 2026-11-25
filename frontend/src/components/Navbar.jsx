
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const menuLinks = [
    { to: '/shop', label: 'Cakes' },
    { to: '/track', label: 'Track order' },
    { to: '/contact', label: 'Contact' },
    ...(user?.isAdmin
      ? [{ to: '/admin', label: 'Admin' }]
      : []),
    ...(user
      ? [
          { to: '/wishlist', label: 'Wishlist' },
          { to: '/orders', label: 'My orders' },
          { to: '/profile', label: 'Profile' }
        ]
      : [{ to: '/login', label: 'Log in' }])
  ];

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="nav-top">
          <div onClick={closeMenu}>
            <Logo />
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav
          id="main-navigation"
          className={`nav-links ${menuOpen ? 'menu-open' : ''}`}
          aria-label="Main navigation"
        >
          {menuLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user && (
            <button
              type="button"
              className="linklike"
              onClick={handleLogout}
            >
              Log out
            </button>
          )}

          <NavLink
            to="/cart"
            className="cart-link"
            onClick={closeMenu}
          >
            Cart
            {count > 0 && (
              <span className="badge">{count}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
