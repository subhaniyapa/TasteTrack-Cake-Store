import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminUsers({ token }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const load = () => api('/users', { token }).then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (u) => {
    setError('');
    try {
      await api(`/users/${u._id}`, { method: 'PATCH', token, body: { isAdmin: !u.isAdmin } });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (u) => {
    if (!confirm(`Delete user ${u.name}? Their reviews will be removed too.`)) return;
    setError('');
    try {
      await api(`/users/${u._id}`, { method: 'DELETE', token });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong>{u._id === me._id && <span className="muted small-text"> (you)</span>}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td className="small-text">{new Date(u.createdAt).toLocaleDateString('en-LK')}</td>
                <td>{u.isAdmin ? 'Admin' : 'Customer'}</td>
                <td className="actions">
                  {u._id !== me._id && (
                    <>
                      <button className="linklike" onClick={() => toggleAdmin(u)}>{u.isAdmin ? 'Make customer' : 'Make admin'}</button>
                      <button className="linklike danger" onClick={() => del(u)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
