import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/shop">Cakes</NavLink>
          <NavLink to="/track">Track order</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/wishlist">Wishlist</NavLink>
              <NavLink to="/orders">My orders</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button
                className="linklike"
                onClick={() => {
                  logout();
                  nav('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
          <NavLink to="/cart" className="cart-link">
            Cart{count > 0 && <span className="badge">{count}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
