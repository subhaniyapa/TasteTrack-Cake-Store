import { Link } from 'react-router-dom';
import Cover from './Cover.jsx';
import { money } from '../api.js';
import { Stars } from './Reviews.jsx';
import HeartButton from './HeartButton.jsx';

export default function ProductCard({ product }) {
  const from = Math.min(...product.sizes.map((s) => s.price));
  return (
    <div className="card-wrap">
    <Link to={`/cake/${product._id}`} className="card">
      <div className="card-img">
        <Cover product={product} />
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.category?.name}</p>
        {product.ratingCount > 0 && <p className="rating-line"><Stars value={product.ratingAvg} /> <span className="muted small-text">{product.ratingAvg} ({product.ratingCount})</span></p>}
        <p className="price">From {money(from)}</p>
      </div>
    </Link>
    <HeartButton productId={product._id} className="card-heart" />
    </div>
  );
}
