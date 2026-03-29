import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user.role === 'MANAGER') navigate('/manager', { replace: true });
      else if (user.role === 'WAITER') navigate('/waiter', { replace: true });
      else if (user.role === 'KITCHEN_STAFF') navigate('/kitchen', { replace: true });
      else if (user.role === 'CUSTOMER') navigate('/customer', { replace: true });
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', {
        email, password,
      });
      login(response.data);
      const role = response.data.role;
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'MANAGER') navigate('/manager', { replace: true });
      else if (role === 'WAITER') navigate('/waiter', { replace: true });
      else if (role === 'KITCHEN_STAFF') navigate('/kitchen', { replace: true });
      else if (role === 'CUSTOMER') navigate('/customer', { replace: true });
      else navigate('/login', { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'ADMIN', email: 'admin@dinesync.com', password: 'admin123', color: '#e74c3c' },
    { role: 'MANAGER', email: 'manager@dinesync.com', password: 'manager123', color: '#3498db' },
    { role: 'WAITER', email: 'waiter@dinesync.com', password: 'waiter123', color: '#2ecc71' },
    { role: 'KITCHEN', email: 'kitchen@dinesync.com', password: 'kitchen123', color: '#f5a623' },
    { role: 'CUSTOMER', email: 'customer@dinesync.com', password: 'customer123', color: '#9b59b6' },
  ];

  const quickLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.overlay}>
          <h1 style={styles.brandName}>🍽️ DineSync</h1>
          <p style={styles.brandTagline}>Restaurant Management System</p>
          <div style={styles.features}>
            <div style={styles.feature}>✅ Real-time Order Tracking</div>
            <div style={styles.feature}>✅ Menu Management</div>
            <div style={styles.feature}>✅ Kitchen Dashboard</div>
            <div style={styles.feature}>✅ Sales Analytics</div>
            <div style={styles.feature}>✅ Multi-Role Access Control</div>
            <div style={styles.feature}>✅ Invoice Generation</div>
          </div>
          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>🔑 Quick Login</p>
            <div style={styles.demoGrid}>
              {demoAccounts.map(account => (
                <div key={account.role}
                  style={{
                    ...styles.demoCard,
                    borderLeft: `3px solid ${account.color}`
                  }}
                  onClick={() => quickLogin(account)}>
                  <div style={{
                    color: account.color,
                    fontWeight: '700', fontSize: '12px'
                  }}>
                    {account.role}
                  </div>
                  <div style={styles.demoEmail}>{account.email}</div>
                </div>
              ))}
            </div>
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
              <input style={styles.input} type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>
            <button
              style={loading ? styles.buttonLoading : styles.button}
              type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div style={styles.rolesInfo}>
            <p style={styles.rolesTitle}>Role Access:</p>
            <div style={styles.rolesList}>
              <span style={styles.roleTag}>👑 Admin</span>
              <span style={styles.roleTag}>📊 Manager</span>
              <span style={styles.roleTag}>🍽️ Waiter</span>
              <span style={styles.roleTag}>👨‍🍳 Kitchen</span>
              <span style={styles.roleTag}>🛒 Customer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'auto',
  },
  overlay: { padding: '40px', color: 'white', width: '100%', maxWidth: '480px' },
  brandName: { fontSize: '42px', fontWeight: '800', margin: '0 0 10px 0', color: '#f5a623' },
  brandTagline: { fontSize: '16px', color: '#ccc', marginBottom: '30px' },
  features: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' },
  feature: {
    fontSize: '14px', color: '#e0e0e0', padding: '8px 15px',
    background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
    borderLeft: '3px solid #f5a623',
  },
  demoBox: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '15px' },
  demoTitle: { color: '#f5a623', fontWeight: '700', fontSize: '13px', marginBottom: '10px' },
  demoGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  demoCard: {
    background: 'rgba(255,255,255,0.08)', padding: '10px 12px',
    borderRadius: '8px', cursor: 'pointer',
  },
  demoEmail: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  right: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f8f9fa',
  },
  formBox: {
    background: 'white', padding: '50px', borderRadius: '16px',
    width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  welcome: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' },
  subtitle: { color: '#888', marginBottom: '30px' },
  error: {
    background: '#ffe0e0', color: '#c0392b', padding: '12px',
    borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
  },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' },
  input: {
    width: '100%', padding: '12px 16px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #f5a623, #e8890c)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px',
  },
  buttonLoading: {
    width: '100%', padding: '14px', background: '#ccc', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: '700', cursor: 'not-allowed', marginTop: '10px',
  },
  rolesInfo: { marginTop: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' },
  rolesTitle: { fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600' },
  rolesList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  roleTag: {
    background: 'white', border: '1px solid #e0e0e0', padding: '4px 10px',
    borderRadius: '20px', fontSize: '11px', color: '#555', fontWeight: '600',
  },
};

export default Login;