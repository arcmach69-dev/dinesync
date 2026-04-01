import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Registration fields
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  // ── QUICK LOGIN ACCOUNTS ──
  const quickLogins = [
    { role: 'ADMIN', email: 'admin@dinesync.com', password: 'admin123', color: '#e74c3c', emoji: '👑' },
    { role: 'MANAGER', email: 'manager@dinesync.com', password: 'manager123', color: '#3498db', emoji: '📊' },
    { role: 'WAITER', email: 'waiter@dinesync.com', password: 'waiter123', color: '#2ecc71', emoji: '🍽️' },
    { role: 'KITCHEN', email: 'kitchen@dinesync.com', password: 'kitchen123', color: '#f5a623', emoji: '👨‍🍳' },
    { role: 'CUSTOMER', email: 'customer@dinesync.com', password: 'customer123', color: '#9b59b6', emoji: '🛒' },
  ];

  // ── HANDLE LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data);
      goToDashboard(res.data.role);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── HANDLE QUICK LOGIN ──
  const handleQuickLogin = async (account) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: account.email,
        password: account.password,
      });
      login(res.data);
      goToDashboard(res.data.role);
    } catch (err) {
      setError('Quick login failed. Make sure services are running.');
    } finally {
      setLoading(false);
    }
  };

  // ── FORMAT PHONE ──
  const formatPhone = (value) => {
    const input = value.replace(/\D/g, '');
    if (!input) return '';
    if (input.length <= 3) return `(${input}`;
    if (input.length <= 6) return `(${input.slice(0,3)}) ${input.slice(3)}`;
    return `(${input.slice(0,3)}) ${input.slice(3,6)}-${input.slice(6,10)}`;
  };

  // ── HANDLE REGISTER ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    // Validations
    if (!regForm.firstName.trim()) {
      setRegError('First name is required.');
      return;
    }
    if (!regForm.lastName.trim()) {
      setRegError('Last name is required.');
      return;
    }
    if (!regForm.email.includes('@')) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regForm.phoneNumber) {
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(regForm.phoneNumber)) {
        setRegError('Please enter valid US phone: (555) 123-4567');
        return;
      }
    }

    setRegLoading(true);
    try {
      await api.post('/api/users', {
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        email: regForm.email,
        password: regForm.password,
        phoneNumber: regForm.phoneNumber || null,
        role: 'CUSTOMER',
      });

      // Auto login after registration
      const loginRes = await api.post('/api/auth/login', {
        email: regForm.email,
        password: regForm.password,
      });

      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        login(loginRes.data);
        goToDashboard(loginRes.data.role);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setRegError('An account with this email already exists.');
      } else {
        setRegError('Registration failed. Please try again.');
      }
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left side — Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.brandLogo}>🍽️</div>
          <h1 style={styles.brandName}>DineSync</h1>
          <p style={styles.brandTagline}>
            Restaurant Management System
          </p>
          <div style={styles.brandDivider} />
          <p style={styles.brandDesc}>
            Complete digital solution for modern restaurants.
            Real-time orders, smart billing, and seamless operations.
          </p>

          <div style={styles.featureList}>
            {[
              '✅ Real-time Order Management',
              '✅ Smart Table Tracking',
              '✅ Automated Billing & Invoice',
              '✅ Live Kitchen Dashboard',
              '✅ Email & SMS Notifications',
              '✅ Sales Analytics & Reports',
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login / Register */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p style={styles.formSubtitle}>
              {activeTab === 'login'
                ? 'Sign in to your DineSync account'
                : 'Register as a new customer'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={styles.tabSwitcher}>
            <button
              style={{
                ...styles.tabBtn,
                background: activeTab === 'login' ? '#f5a623' : 'transparent',
                color: activeTab === 'login' ? 'white' : '#888',
              }}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setRegError('');
                setSuccessMsg('');
              }}>
              🔐 Sign In
            </button>
            <button
              style={{
                ...styles.tabBtn,
                background: activeTab === 'register' ? '#f5a623' : 'transparent',
                color: activeTab === 'register' ? 'white' : '#888',
              }}
              onClick={() => {
                setActiveTab('register');
                setError('');
                setRegError('');
                setSuccessMsg('');
              }}>
              🆕 Register
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLogin}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input style={styles.input}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required />
                </div>
                {error && (
                  <div style={styles.errorMsg}>❌ {error}</div>
                )}
                <button style={styles.submitBtn} type="submit"
                  disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>

              {/* Quick login */}
              <div style={styles.quickSection}>
                <div style={styles.quickLabel}>
                  ⚡ Quick Login (Demo)
                </div>
                <div style={styles.quickGrid}>
                  {quickLogins.map(account => (
                    <button key={account.role}
                      style={{
                        ...styles.quickBtn,
                        borderColor: account.color,
                        color: account.color,
                      }}
                      onClick={() => handleQuickLogin(account)}>
                      <span style={styles.quickEmoji}>
                        {account.emoji}
                      </span>
                      <span style={styles.quickRole}>
                        {account.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.registerHint}>
                New customer?{' '}
                <span style={styles.registerLink}
                  onClick={() => setActiveTab('register')}>
                  Create an account →
                </span>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === 'register' && (
            <div>
              {successMsg && (
                <div style={styles.successMsg}>
                  🎉 {successMsg}
                </div>
              )}
              <form onSubmit={handleRegister}>
                <div style={styles.twoCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Name *</label>
                    <input style={styles.input}
                      placeholder="John"
                      value={regForm.firstName}
                      onChange={e => setRegForm({
                        ...regForm, firstName: e.target.value
                      })}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Last Name *</label>
                    <input style={styles.input}
                      placeholder="Smith"
                      value={regForm.lastName}
                      onChange={e => setRegForm({
                        ...regForm, lastName: e.target.value
                      })}
                      required />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input style={styles.input}
                    type="email"
                    placeholder="john@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({
                      ...regForm, email: e.target.value
                    })}
                    required />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Phone Number
                    <span style={styles.optional}> — optional</span>
                  </label>
                  <input style={styles.input}
                    placeholder="(555) 123-4567"
                    value={regForm.phoneNumber}
                    maxLength={14}
                    onChange={e => setRegForm({
                      ...regForm,
                      phoneNumber: formatPhone(e.target.value)
                    })} />
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password *</label>
                    <input style={styles.input}
                      type="password"
                      placeholder="Min 6 characters"
                      value={regForm.password}
                      onChange={e => setRegForm({
                        ...regForm, password: e.target.value
                      })}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password *</label>
                    <input style={styles.input}
                      type="password"
                      placeholder="Repeat password"
                      value={regForm.confirmPassword}
                      onChange={e => setRegForm({
                        ...regForm, confirmPassword: e.target.value
                      })}
                      required />
                  </div>
                </div>

                {regError && (
                  <div style={styles.errorMsg}>❌ {regError}</div>
                )}

                <div style={styles.customerNote}>
                  🛒 You will be registered as a <strong>Customer</strong>.
                  You can browse our menu, place orders, and track your
                  order status in real time.
                </div>

                <button style={styles.submitBtn} type="submit"
                  disabled={regLoading}>
                  {regLoading
                    ? 'Creating Account...'
                    : '🆕 Create My Account →'}
                </button>
              </form>

              <div style={styles.registerHint}>
                Already have an account?{' '}
                <span style={styles.registerLink}
                  onClick={() => setActiveTab('login')}>
                  Sign in →
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', height: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },

  // LEFT PANEL
  leftPanel: {
    width: '45%', flexShrink: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px',
  },
  brandContent: { color: 'white', maxWidth: '380px' },
  brandLogo: {
    fontSize: '72px', marginBottom: '15px', textAlign: 'center',
  },
  brandName: {
    fontSize: '48px', fontWeight: '800', color: '#f5a623',
    margin: '0 0 8px', textAlign: 'center',
  },
  brandTagline: {
    fontSize: '16px', color: 'rgba(255,255,255,0.7)',
    textAlign: 'center', margin: '0 0 20px',
  },
  brandDivider: {
    height: '2px', background: 'rgba(245,166,35,0.4)',
    margin: '20px 0',
  },
  brandDesc: {
    fontSize: '14px', color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.7', marginBottom: '25px', textAlign: 'center',
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  featureItem: {
    fontSize: '14px', color: 'rgba(255,255,255,0.85)',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  // RIGHT PANEL
  rightPanel: {
    flex: 1, background: '#f0f2f5',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '30px', overflowY: 'auto',
  },
  formCard: {
    background: 'white', borderRadius: '20px',
    padding: '35px', width: '100%', maxWidth: '480px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  formHeader: { marginBottom: '20px' },
  formTitle: {
    fontSize: '26px', fontWeight: '800',
    color: '#1a1a2e', margin: '0 0 6px',
  },
  formSubtitle: { color: '#888', fontSize: '14px', margin: 0 },

  // TABS
  tabSwitcher: {
    display: 'flex', background: '#f0f2f5',
    borderRadius: '10px', padding: '4px',
    marginBottom: '25px', gap: '4px',
  },
  tabBtn: {
    flex: 1, padding: '10px', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
    transition: 'all 0.2s',
  },

  // FORM
  formGroup: { marginBottom: '16px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#333', marginBottom: '6px',
  },
  optional: { color: '#aaa', fontWeight: '400' },
  input: {
    width: '100%', padding: '11px 14px',
    border: '2px solid #e0e0e0', borderRadius: '10px',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  errorMsg: {
    background: '#fff5f5', color: '#e74c3c',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '15px',
    border: '1px solid #fecaca',
  },
  successMsg: {
    background: '#f0fff4', color: '#2ecc71',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '15px',
    border: '1px solid #bbf7d0', fontWeight: '600',
  },
  customerNote: {
    background: '#f8f4ff', color: '#9b59b6',
    padding: '12px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '16px',
    border: '1px solid #e9d5ff', lineHeight: '1.5',
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #f5a623, #e67e22)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    marginBottom: '20px',
  },

  // QUICK LOGIN
  quickSection: { marginBottom: '20px' },
  quickLabel: {
    fontSize: '13px', fontWeight: '600', color: '#888',
    marginBottom: '12px', textAlign: 'center',
  },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
  quickBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '4px', padding: '10px 5px', background: 'white',
    border: '2px solid', borderRadius: '10px', cursor: 'pointer',
  },
  quickEmoji: { fontSize: '20px' },
  quickRole: { fontSize: '10px', fontWeight: '700' },

  // HINTS
  registerHint: {
    textAlign: 'center', fontSize: '13px', color: '#888',
  },
  registerLink: {
    color: '#f5a623', fontWeight: '600',
    cursor: 'pointer', textDecoration: 'underline',
  },
};

export default Login;
