import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(`/auth/reset/${token}`, { method: 'POST', body: { password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page auth">
      <h1>Choose a new password</h1>
      {done ? (
        <>
          <p className="notice" role="status">Your password has been changed.</p>
          <Link to="/login" className="btn">Log in</Link>
        </>
      ) : (
        <form className="form" onSubmit={submit}>
          <div className="field"><label htmlFor="rp">New password (6+ characters)</label><input id="rp" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn block">Change password</button>
        </form>
      )}
    </div>
  );
}
