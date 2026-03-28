import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerId: 1, tableId: '', waiterId: '',
    orderType: 'DINE_IN', orderStatus: 'RECEIVED', totalAmount: 0,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/orders', form);
      setShowForm(false);
      setForm({
        customerId: 1, tableId: '', waiterId: '',
        orderType: 'DINE_IN', orderStatus: 'RECEIVED', totalAmount: 0,
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      await api.put(`/api/orders/${order.orderId}`, {
        ...order, orderStatus: newStatus
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this order?')) {
      await api.delete(`/api/orders/${id}`);
      fetchOrders();
    }
  };

  const statusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623',
    READY: '#9b59b6', DELIVERED: '#2ecc71', CANCELLED: '#e74c3c',
  };

  const orderTypeColors = {
    DINE_IN: '#3498db', TAKEAWAY: '#f5a623', ONLINE: '#9b59b6',
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.backBtn} onClick={() => navigate('/admin')}>
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
            <h1 style={styles.title}>Order Management</h1>
            <p style={styles.subtitle}>{orders.length} total orders</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> New Order
          </button>
        </div>

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>Create New Order</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Customer ID</label>
                    <input style={styles.input} type="number"
                      value={form.customerId}
                      onChange={e => setForm({...form, customerId: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Table ID (optional)</label>
                    <input style={styles.input} type="number"
                      value={form.tableId}
                      onChange={e => setForm({...form, tableId: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Waiter ID (optional)</label>
                    <input style={styles.input} type="number"
                      value={form.waiterId}
                      onChange={e => setForm({...form, waiterId: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Order Type</label>
                    <select style={styles.input} value={form.orderType}
                      onChange={e => setForm({...form, orderType: e.target.value})}>
                      {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                        <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Amount</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.totalAmount}
                      onChange={e => setForm({...form, totalAmount: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.orderStatus}
                      onChange={e => setForm({...form, orderStatus: e.target.value})}>
                      {['RECEIVED','PREPARING','READY','DELIVERED','CANCELLED'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer ID</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Update Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>#{order.orderId}</strong>
                  </td>
                  <td style={styles.td}>Customer {order.customerId}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: orderTypeColors[order.orderType]
                    }}>
                      {order.orderType}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong>${order.totalAmount}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: statusColors[order.orderStatus]
                    }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.statusSelect}
                      value={order.orderStatus}
                      onChange={e =>
                        handleStatusUpdate(order, e.target.value)}>
                      {['RECEIVED','PREPARING','READY',
                        'DELIVERED','CANCELLED'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}>
                    {order.orderStatus === 'DELIVERED' && (
                      <button
                        style={styles.invoiceBtn}
                        onClick={() =>
                          navigate(`/invoice/${order.orderId}`)}>
                        🧾 Bill
                      </button>
                    )}
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(order.orderId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
                    No orders yet. Create your first order!
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
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', border: 'none',
    padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '600px', maxHeight: '80vh', overflow: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' },
  input: {
    padding: '10px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 20px', background: '#f5a623', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  tableBox: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa' },
  th: {
    padding: '15px 20px', textAlign: 'left',
    fontSize: '13px', fontWeight: '600', color: '#555',
  },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#333' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  statusSelect: {
    padding: '6px 10px', border: '2px solid #e0e0e0',
    borderRadius: '6px', fontSize: '13px', cursor: 'pointer', outline: 'none',
  },
  invoiceBtn: {
    background: '#2ecc71', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
    marginRight: '5px', fontSize: '13px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default OrderManagement;