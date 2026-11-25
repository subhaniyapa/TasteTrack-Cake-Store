import CakeArt, { toneOf, variantOf } from './CakeArt.jsx';
import { assetUrl } from '../api.js';

// Shows the cake's photo if it has one, otherwise a matching illustration.
export default function Cover({ product, className = '' }) {
  if (product.image) return <img className={className} src={assetUrl(product.image)} alt={product.name} loading="lazy" />;
  return <CakeArt className={className} variant={variantOf(product)} tone={toneOf(product.name)} />;
}
