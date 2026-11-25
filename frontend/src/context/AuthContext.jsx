import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tt_user'));
    } catch {
      return null;
    }
  });

  const save = (u) => {
    setUser(u);
    if (u) localStorage.setItem('tt_user', JSON.stringify(u));
    else localStorage.removeItem('tt_user');
  };

  const login = async (email, password) => save(await api('/auth/login', { method: 'POST', body: { email, password } }));
  const register = async (form) => save(await api('/auth/register', { method: 'POST', body: form }));
  const logout = () => save(null);
  const update = (changes) => save({ ...user, ...changes }); // keep token, change profile fields

  return <AuthContext.Provider value={{ user, token: user?.token, login, register, logout, update }}>{children}</AuthContext.Provider>;
}
