import { Link } from 'react-router-dom';
import siteConfig from '../siteConfig.js';

export default function Logo({ small = false }) {
  return (
    <Link to="/" className={'logo' + (small ? ' small' : '')} aria-label={`${siteConfig.name} home`}>
      <svg viewBox="0 0 64 64" width={small ? 26 : 32} height={small ? 26 : 32} aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#B0627C" />
        <rect x="14" y="36" width="36" height="14" rx="4" fill="#fff" />
        <rect x="21" y="26" width="22" height="12" rx="3.5" fill="#F6E6EB" />
        <rect x="30.5" y="16" width="3" height="10" rx="1.5" fill="#fff" />
        <path d="M32 9 q-3.5 4.5 0 7.5 q3.5 -3 0 -7.5z" fill="#F5B942" />
      </svg>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
