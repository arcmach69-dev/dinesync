import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      login(response.data);
      const role = response.data.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'MANAGER') navigate('/admin');
      else if (role === 'WAITER') navigate('/waiter');
      else if (role === 'KITCHEN_STAFF') navigate('/kitchen');
      else navigate('/admin');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.overlay}>
          <h1 style={styles.brandName}>🍽️ DineSync</h1>
          <p style={styles.brandTagline}>
            Restaurant Management System
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>✅ Real-time Order Tracking</div>
            <div style={styles.feature}>✅ Menu Management</div>
            <div style={styles.feature}>✅ Kitchen Dashboard</div>
            <div style={styles.feature}>✅ Sales Analytics</div>
          </div>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.welcome}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="admin@dinesync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              style={loading ? styles.buttonLoading : styles.button}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    padding: '40px',
    color: 'white',
  },
  brandName: {
    fontSize: '48px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    color: '#f5a623',
  },
  brandTagline: {
    fontSize: '18px',
    color: '#ccc',
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  feature: {
    fontSize: '16px',
    color: '#e0e0e0',
    padding: '10px 15px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    borderLeft: '3px solid #f5a623',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  formBox: {
    background: 'white',
    padding: '50px',
    borderRadius: '16px',
    width: '400px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  welcome: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#888',
    marginBottom: '30px',
  },
  error: {
    background: '#ffe0e0',
    color: '#c0392b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.3s',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f5a623, #e8890c)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.2s',
  },
  buttonLoading: {
    width: '100%',
    padding: '14px',
    background: '#ccc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '10px',
  },
};

export default Login;