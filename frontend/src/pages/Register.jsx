import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(f);
      nav('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page auth">
      <h1>Create account</h1>
      <form className="form" onSubmit={submit}>
        <div className="field"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} /></div>
        <div className="field"><label htmlFor="em">Email</label><input id="em" type="email" required value={f.email} onChange={set('email')} /></div>
        <div className="field"><label htmlFor="ph">Phone</label><input id="ph" value={f.phone} onChange={set('phone')} /></div>
        <div className="field"><label htmlFor="pw">Password (6+ characters)</label><input id="pw" type="password" minLength={6} required value={f.password} onChange={set('password')} /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn block">Create account</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
