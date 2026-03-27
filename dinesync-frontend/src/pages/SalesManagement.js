import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    saleDate: '', totalOrders: '', totalRevenue: '',
    totalRefunds: '', cancellations: '', kitchenCost: '',
    grossProfit: '', netProfit: '', totalInvestment: '',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    try {
      const res = await api.get('/api/sales');
      setSales(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/sales/${editItem.saleId}`, form);
      } else {
        await api.post('/api/sales', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({
        saleDate: '', totalOrders: '', totalRevenue: '',
        totalRefunds: '', cancellations: '', kitchenCost: '',
        grossProfit: '', netProfit: '', totalInvestment: '',
      });
      fetchSales();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await api.delete(`/api/sales/${id}`);
      fetchSales();
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.totalRevenue || 0), 0);
  const totalProfit = sales.reduce((sum, s) => sum + parseFloat(s.netProfit || 0), 0);
  const totalOrders = sales.reduce((sum, s) => sum + parseInt(s.totalOrders || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.backBtn} onClick={() => navigate('/admin')}>
          <FaArrowLeft /> <span style={{marginLeft:'8px'}}>Back to Dashboard</span>
        </div>
        <div style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
          🚪 Logout
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Sales Analytics</h1>
            <p style={styles.subtitle}>{sales.length} records</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Record
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={{...styles.statValue, color: '#2ecc71'}}>
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Net Profit</div>
            <div style={{...styles.statValue, color: '#3498db'}}>
              ${totalProfit.toFixed(2)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Orders</div>
            <div style={{...styles.statValue, color: '#f5a623'}}>
              {totalOrders}
            </div>
          </div>
        </div>

        {/* Chart */}
        {sales.length > 0 && (
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>Revenue vs Net Profit</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="saleDate" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRevenue" fill="#f5a623" name="Revenue" />
                <Bar dataKey="netProfit" fill="#2ecc71" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Sales Record' : 'Add Sales Record'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  {[
                    { key: 'saleDate', label: 'Sale Date', type: 'date' },
                    { key: 'totalOrders', label: 'Total Orders', type: 'number' },
                    { key: 'totalRevenue', label: 'Total Revenue', type: 'number' },
                    { key: 'totalRefunds', label: 'Total Refunds', type: 'number' },
                    { key: 'cancellations', label: 'Cancellations', type: 'number' },
                    { key: 'kitchenCost', label: 'Kitchen Cost', type: 'number' },
                    { key: 'grossProfit', label: 'Gross Profit', type: 'number' },
                    { key: 'netProfit', label: 'Net Profit', type: 'number' },
                    { key: 'totalInvestment', label: 'Total Investment', type: 'number' },
                  ].map(field => (
                    <div key={field.key} style={styles.formGroup}>
                      <label style={styles.label}>{field.label}</label>
                      <input
                        style={styles.input}
                        type={field.type}
                        step={field.type === 'number' ? '0.01' : undefined}
                        value={form[field.key]}
                        onChange={e => setForm({...form, [field.key]: e.target.value})}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setEditItem(null); }}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update' : 'Add Record'}
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
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Orders</th>
                <th style={styles.th}>Revenue</th>
                <th style={styles.th}>Refunds</th>
                <th style={styles.th}>Kitchen Cost</th>
                <th style={styles.th}>Net Profit</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(item => (
                <tr key={item.saleId} style={styles.tableRow}>
                  <td style={styles.td}>{item.saleDate}</td>
                  <td style={styles.td}>{item.totalOrders}</td>
                  <td style={styles.td}>
                    <span style={{color:'#2ecc71', fontWeight:'600'}}>
                      ${item.totalRevenue}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{color:'#e74c3c'}}>${item.totalRefunds}</span>
                  </td>
                  <td style={styles.td}>${item.kitchenCost}</td>
                  <td style={styles.td}>
                    <span style={{color:'#3498db', fontWeight:'700'}}>
                      ${item.netProfit}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(item.saleId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="7" style={{...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'}}>
                    No sales records yet.
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
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px', marginBottom: '25px',
  },
  statCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  statLabel: { color: '#888', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '32px', fontWeight: '800' },
  chartBox: {
    background: 'white', borderRadius: '12px', padding: '25px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  chartTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' },
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
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#333' },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default SalesManagement;