import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { token } = useAuth();
  const [ids, setIds] = useState([]);

  // load the saved cake ids whenever someone logs in, clear them on log out
  useEffect(() => {
    if (token) api('/wishlist/ids', { token }).then(setIds).catch(() => setIds([]));
    else setIds([]);
  }, [token]);

  const has = (id) => ids.includes(id);

  const toggle = async (id) => {
    const saved = has(id);
    setIds((list) => (saved ? list.filter((x) => x !== id) : [...list, id])); // update the heart straight away
    try {
      await api(`/wishlist/${id}`, { method: saved ? 'DELETE' : 'POST', token });
    } catch {
      setIds((list) => (saved ? [...list, id] : list.filter((x) => x !== id))); // put it back if the server said no
    }
  };

  return <WishlistContext.Provider value={{ ids, has, toggle }}>{children}</WishlistContext.Provider>;
}
