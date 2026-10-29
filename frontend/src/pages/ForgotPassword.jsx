import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const d = await api('/auth/forgot', { method: 'POST', body: { email } });
      setMsg(d.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page auth">
      <h1>Forgot password</h1>
      <p className="muted">Enter your email and we will send you a link to choose a new password.</p>
      {msg ? <p className="notice" role="status">{msg}</p> : (
        <form className="form" onSubmit={submit}>
          <div className="field"><label htmlFor="fe">Email</label><input id="fe" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn block">Send reset link</button>
        </form>
      )}
      <p className="muted"><Link to="/login">Back to log in</Link></p>
    </div>
  );
}
