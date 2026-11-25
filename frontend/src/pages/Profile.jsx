import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, token, update, logout } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [delPw, setDelPw] = useState('');
  const [msg, setMsg] = useState({});
  const say = (key, text, error = false) => setMsg((m) => ({ ...m, [key]: { text, error } }));

  if (!user) return <Navigate to="/login" replace />;

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      update(await api('/users/me', { method: 'PUT', token, body: f }));
      say('profile', 'Profile updated.');
    } catch (err) {
      say('profile', err.message, true);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api('/users/me/password', { method: 'PUT', token, body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      say('pw', 'Password changed.');
    } catch (err) {
      say('pw', err.message, true);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!confirm('Delete your account for good? This cannot be undone.')) return;
    try {
      await api('/users/me', { method: 'DELETE', token, body: { password: delPw } });
      logout();
      nav('/');
    } catch (err) {
      say('del', err.message, true);
    }
  };

  const Msg = ({ k }) => (msg[k] ? <p className={msg[k].error ? 'error' : 'notice'} role="status">{msg[k].text}</p> : null);

  return (
    <div className="container page narrow">
      <h1>My profile</h1>

      <form className="form box" onSubmit={saveProfile}>
        <h2>Your details</h2>
        <div className="field"><label htmlFor="pn">Full name</label><input id="pn" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="two">
          <div className="field"><label htmlFor="pe">Email</label><input id="pe" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="field"><label htmlFor="pp">Phone</label><input id="pp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        </div>
        <Msg k="profile" />
        <button className="btn">Save changes</button>
      </form>

      <form className="form box" onSubmit={changePassword}>
        <h2>Change password</h2>
        <div className="two">
          <div className="field"><label htmlFor="cp">Current password</label><input id="cp" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div className="field"><label htmlFor="np">New password (6+ characters)</label><input id="np" type="password" minLength={6} required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
        </div>
        <Msg k="pw" />
        <button className="btn">Change password</button>
      </form>

      <form className="form box danger-zone" onSubmit={deleteAccount}>
        <h2>Delete account</h2>
        <p className="muted">This removes your account and your reviews. Your past orders stay on record with the shop.</p>
        <div className="field"><label htmlFor="dp">Enter your password to confirm</label><input id="dp" type="password" required value={delPw} onChange={(e) => setDelPw(e.target.value)} /></div>
        <Msg k="del" />
        <button className="btn danger-btn">Delete my account</button>
      </form>
    </div>
  );
}
