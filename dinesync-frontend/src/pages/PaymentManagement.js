import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleNavigation } from '../context/useRoleNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/payments');
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const methodColors = {
    CASH: '#2ecc71', CARD: '#3498db',
    UPI: '#9b59b6', APPLE_PAY: '#1a1a2e',
  };

  const statusColors = {
    PAID: '#2ecc71', PENDING: '#f5a623', REFUNDED: '#e74c3c',
  };

  const methodCounts = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.backBtn} onClick={() => goToDashboard()}>
          <FaArrowLeft />
          <span style={{marginLeft:'8px'}}>Back to Dashboard</span>
        </div>
        <div style={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login'); }}>
          🚪 Logout
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>💳 Payment Management</h1>
            <p style={styles.subtitle}>{payments.length} total transactions</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Revenue Collected</div>
            <div style={{...styles.statValue, color:'#2ecc71'}}>
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Transactions</div>
            <div style={{...styles.statValue, color:'#3498db'}}>
              {payments.length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Paid</div>
            <div style={{...styles.statValue, color:'#2ecc71'}}>
              {payments.filter(p => p.paymentStatus === 'PAID').length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{...styles.statValue, color:'#f5a623'}}>
              {payments.filter(p => p.paymentStatus === 'PENDING').length}
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div style={styles.methodBox}>
          <h3 style={styles.methodTitle}>Payment Method Breakdown</h3>
          <div style={styles.methodGrid}>
            {['CASH','CARD','UPI','APPLE_PAY'].map(method => (
              <div key={method} style={{
                ...styles.methodCard,
                borderTop: `4px solid ${methodColors[method]}`
              }}>
                <div style={styles.methodIcon}>
                  {method === 'CASH' && '💵'}
                  {method === 'CARD' && '💳'}
                  {method === 'UPI' && '📱'}
                  {method === 'APPLE_PAY' && '🍎'}
                </div>
                <div style={styles.methodName}>{method}</div>
                <div style={{
                  ...styles.methodCount,
                  color: methodColors[method]
                }}>
                  {methodCounts[method] || 0} transactions
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Payment ID</th>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.paymentId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>#{payment.paymentId}</strong>
                  </td>
                  <td style={styles.td}>
                    Order #{payment.orderId}
                  </td>
                  <td style={styles.td}>
                    <strong style={{color:'#2ecc71'}}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: methodColors[payment.paymentMethod]
                    }}>
                      {payment.paymentMethod === 'CASH' && '💵 '}
                      {payment.paymentMethod === 'CARD' && '💳 '}
                      {payment.paymentMethod === 'UPI' && '📱 '}
                      {payment.paymentMethod === 'APPLE_PAY' && '🍎 '}
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: statusColors[payment.paymentStatus]
                    }}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: {
    width: '250px', background: '#1a1a2e', color: 'white',
    display: 'flex', flexDirection: 'column', padding: '20px 0',
  },
  logo: { display: 'flex', alignItems: 'center', padding: '0 20px 30px', gap: '10px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },
  backBtn: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: '#aaa', fontSize: '14px', marginTop: '10px',
  },
  logoutBtn: {
    marginTop: 'auto', padding: '15px 20px', cursor: 'pointer',
    color: '#e74c3c', borderTop: '1px solid #2d2d44', fontSize: '14px',
  },
  main: { flex: 1, background: '#f0f2f5', overflow: 'auto', padding: '30px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'white', padding: '20px 30px', borderRadius: '12px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  subtitle: { color: '#888', margin: '4px 0 0', fontSize: '14px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '25px',
  },
  statCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  statLabel: { color: '#888', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  methodBox: {
    background: 'white', borderRadius: '12px', padding: '25px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  methodTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '15px' },
  methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
  methodCard: {
    background: '#f8f9fa', borderRadius: '10px',
    padding: '20px', textAlign: 'center',
  },
  methodIcon: { fontSize: '32px', marginBottom: '8px' },
  methodName: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  methodCount: { fontSize: '13px', fontWeight: '600' },
  tableBox: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#333' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
};

export default PaymentManagement;