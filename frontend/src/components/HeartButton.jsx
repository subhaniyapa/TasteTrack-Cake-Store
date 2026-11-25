import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function HeartButton({ productId, label = false, className = '' }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const nav = useNavigate();
  const saved = has(productId);

  const click = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return nav('/login');
    toggle(productId);
  };

  return (
    <button type="button" className={`heart ${saved ? 'on' : ''} ${className}`} onClick={click} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {label && <span>{saved ? 'Saved' : 'Save for later'}</span>}
    </button>
  );
}
