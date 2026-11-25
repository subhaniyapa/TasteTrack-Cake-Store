import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page auth">
      <h1>Log in</h1>
      <form className="form" onSubmit={submit}>
        <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn block">Log in</button>
      </form>
      <p className="muted"><Link to="/forgot-password">Forgot your password?</Link></p>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
