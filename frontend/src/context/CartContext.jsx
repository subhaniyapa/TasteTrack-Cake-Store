import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const keyOf = (i) => [i.productId, i.size, i.flavour, i.message].join('|');

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tt_cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('tt_cart', JSON.stringify(items)), [items]);

  const add = (item) =>
    setItems((prev) => {
      const k = keyOf(item);
      const found = prev.find((p) => keyOf(p) === k);
      if (found) return prev.map((p) => (keyOf(p) === k ? { ...p, qty: Math.min(p.qty + item.qty, 20) } : p));
      return [...prev, item];
    });

  const setQty = (k, qty) => setItems((prev) => prev.map((p) => (keyOf(p) === k ? { ...p, qty: Math.min(Math.max(qty, 1), 20) } : p)));
  const remove = (k) => setItems((prev) => prev.filter((p) => keyOf(p) !== k));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal, keyOf }}>{children}</CartContext.Provider>;
}
