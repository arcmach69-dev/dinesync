import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleNavigation } from '../context/useRoleNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPaperPlane, FaCheck } from 'react-icons/fa';

const NotificationCenter = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();
  const [activeTab, setActiveTab] = useState('order');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [orderForm, setOrderForm] = useState({
    to: '', orderId: '', orderType: 'DINE_IN', amount: '',
  });
  const [stockForm, setStockForm] = useState({
    to: '', ingredientName: '', quantityLeft: '', unit: 'kg',
  });
  const [reportForm, setReportForm] = useState({
    to: '', date: new Date().toISOString().split('T')[0],
    totalOrders: '', totalRevenue: '', netProfit: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    to: '', orderId: '', amount: '', paymentMethod: 'CASH',
  });
  const [testForm, setTestForm] = useState({ to: '' });

  const handleSend = async (endpoint, data) => {
    setSending(true);
    setSent(false);
    try {
      await api.post(`/api/email/${endpoint}`, data);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      alert('Failed to send email. Check email configuration.');
    } finally {
      setSending(false);
    }
  };

  const tabs = [
    { id: 'order', label: '📦 Order Confirmation' },
    { id: 'stock', label: '⚠️ Low Stock Alert' },
    { id: 'report', label: '📊 Daily Report' },
    { id: 'payment', label: '💳 Payment Confirmation' },
    { id: 'test', label: '🧪 Test Email' },
  ];

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
            <h1 style={styles.title}>📧 Notification Center</h1>
            <p style={styles.subtitle}>
              Send email notifications to staff and customers
            </p>
          </div>
          {sent && (
            <div style={styles.sentBadge}>
              <FaCheck /> Email Sent Successfully!
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map(tab => (
            <div key={tab.id}
              style={activeTab === tab.id
                ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </div>
          ))}
        </div>

        <div style={styles.formBox}>
          {/* ORDER CONFIRMATION */}
          {activeTab === 'order' && (
            <div>
              <h2 style={styles.formTitle}>Send Order Confirmation</h2>
              <p style={styles.formDesc}>
                Send order details to customer email after order is placed.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Email</label>
                  <input style={styles.input}
                    type="email" placeholder="customer@example.com"
                    value={orderForm.to}
                    onChange={e => setOrderForm({...orderForm, to: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Order ID</label>
                  <input style={styles.input} type="number"
                    value={orderForm.orderId}
                    onChange={e => setOrderForm({...orderForm, orderId: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Order Type</label>
                  <select style={styles.input} value={orderForm.orderType}
                    onChange={e => setOrderForm({...orderForm, orderType: e.target.value})}>
                    {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                      <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount ($)</label>
                  <input style={styles.input} type="number" step="0.01"
                    value={orderForm.amount}
                    onChange={e => setOrderForm({...orderForm, amount: e.target.value})} />
                </div>
              </div>
              <button style={styles.sendBtn}
                disabled={sending}
                onClick={() => handleSend('order-confirmation', orderForm)}>
                <FaPaperPlane />
                {sending ? ' Sending...' : ' Send Order Confirmation'}
              </button>
            </div>
          )}

          {/* LOW STOCK */}
          {activeTab === 'stock' && (
            <div>
              <h2 style={styles.formTitle}>Send Low Stock Alert</h2>
              <p style={styles.formDesc}>
                Alert admin/manager when inventory is running low.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Manager Email</label>
                  <input style={styles.input}
                    type="email" placeholder="manager@dinesync.com"
                    value={stockForm.to}
                    onChange={e => setStockForm({...stockForm, to: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ingredient Name</label>
                  <input style={styles.input}
                    placeholder="Chicken"
                    value={stockForm.ingredientName}
                    onChange={e => setStockForm({...stockForm, ingredientName: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity Left</label>
                  <input style={styles.input} type="number" step="0.01"
                    value={stockForm.quantityLeft}
                    onChange={e => setStockForm({...stockForm, quantityLeft: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit</label>
                  <select style={styles.input} value={stockForm.unit}
                    onChange={e => setStockForm({...stockForm, unit: e.target.value})}>
                    {['kg','liters','pieces','grams'].map(u =>
                      <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <button style={{...styles.sendBtn, background:'#e74c3c'}}
                disabled={sending}
                onClick={() => handleSend('low-stock', stockForm)}>
                <FaPaperPlane />
                {sending ? ' Sending...' : ' Send Low Stock Alert'}
              </button>
            </div>
          )}

          {/* DAILY REPORT */}
          {activeTab === 'report' && (
            <div>
              <h2 style={styles.formTitle}>Send Daily Sales Report</h2>
              <p style={styles.formDesc}>
                Send end of day sales summary to admin/manager.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Admin Email</label>
                  <input style={styles.input}
                    type="email" placeholder="admin@dinesync.com"
                    value={reportForm.to}
                    onChange={e => setReportForm({...reportForm, to: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input style={styles.input} type="date"
                    value={reportForm.date}
                    onChange={e => setReportForm({...reportForm, date: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Orders</label>
                  <input style={styles.input} type="number"
                    value={reportForm.totalOrders}
                    onChange={e => setReportForm({...reportForm, totalOrders: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Revenue ($)</label>
                  <input style={styles.input} type="number" step="0.01"
                    value={reportForm.totalRevenue}
                    onChange={e => setReportForm({...reportForm, totalRevenue: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Net Profit ($)</label>
                  <input style={styles.input} type="number" step="0.01"
                    value={reportForm.netProfit}
                    onChange={e => setReportForm({...reportForm, netProfit: e.target.value})} />
                </div>
              </div>
              <button style={{...styles.sendBtn, background:'#9b59b6'}}
                disabled={sending}
                onClick={() => handleSend('daily-report', reportForm)}>
                <FaPaperPlane />
                {sending ? ' Sending...' : ' Send Daily Report'}
              </button>
            </div>
          )}

          {/* PAYMENT CONFIRMATION */}
          {activeTab === 'payment' && (
            <div>
              <h2 style={styles.formTitle}>Send Payment Confirmation</h2>
              <p style={styles.formDesc}>
                Send payment receipt to customer after payment is collected.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Email</label>
                  <input style={styles.input}
                    type="email" placeholder="customer@example.com"
                    value={paymentForm.to}
                    onChange={e => setPaymentForm({...paymentForm, to: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Order ID</label>
                  <input style={styles.input} type="number"
                    value={paymentForm.orderId}
                    onChange={e => setPaymentForm({...paymentForm, orderId: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount ($)</label>
                  <input style={styles.input} type="number" step="0.01"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Method</label>
                  <select style={styles.input} value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}>
                    {['CASH','CARD','UPI','APPLE_PAY'].map(m =>
                      <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <button style={{...styles.sendBtn, background:'#2ecc71'}}
                disabled={sending}
                onClick={() => handleSend('payment-confirmation', paymentForm)}>
                <FaPaperPlane />
                {sending ? ' Sending...' : ' Send Payment Confirmation'}
              </button>
            </div>
          )}

          {/* TEST EMAIL */}
          {activeTab === 'test' && (
            <div>
              <h2 style={styles.formTitle}>Send Test Email</h2>
              <p style={styles.formDesc}>
                Verify your email configuration is working correctly.
              </p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input}
                    type="email" placeholder="test@example.com"
                    value={testForm.to}
                    onChange={e => setTestForm({...testForm, to: e.target.value})} />
                </div>
              </div>
              <button style={{...styles.sendBtn, background:'#3498db'}}
                disabled={sending}
                onClick={() => handleSend('test', testForm)}>
                <FaPaperPlane />
                {sending ? ' Sending...' : ' Send Test Email'}
              </button>
            </div>
          )}
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
  sentBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#e8f8f0', color: '#2ecc71', padding: '10px 20px',
    borderRadius: '8px', fontWeight: '600', fontSize: '14px',
  },
  tabs: {
    display: 'flex', gap: '5px', marginBottom: '25px',
    background: 'white', padding: '10px', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', color: '#888',
  },
  tabActive: {
    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', color: 'white',
    background: '#f5a623',
  },
  formBox: {
    background: 'white', borderRadius: '12px', padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  formTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' },
  formDesc: { color: '#888', fontSize: '14px', marginBottom: '25px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' },
  input: {
    padding: '10px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  sendBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', border: 'none',
    padding: '14px 24px', borderRadius: '8px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer',
  },
};

export default NotificationCenter;