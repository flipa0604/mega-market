import React, { useState } from 'react';
import './Login.css';

const STORAGE_KEY = 'mega_admin_auth';

const defaultLogin = import.meta.env.VITE_ADMIN_LOGIN || 'nodirbek';
const defaultPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'zxcv1234';

export function isAuthenticated() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAuthenticated(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function Login({ onSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login.trim() === defaultLogin && password === defaultPassword) {
      setAuthenticated(true);
      onSuccess();
    } else {
      setError('Login yoki parol noto‘g‘ri');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Mega Market — Admin</h1>
        <p className="login-subtitle">Kirish</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="Login"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Parol</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Parol"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
