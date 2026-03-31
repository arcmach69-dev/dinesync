import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('daily');
  const [form, setForm] = useState({
    saleDate: new Date().toISOString().split('T')[0],
    totalOrders: '', totalRevenue: '', totalRefunds: '0',
    cancellations: '0', kitchenCost: '', grossProfit: '',
    netProfit: '', totalInvestment: '',
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

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
      await api.post('/api/sales', form);
      setShowForm(false);
      setForm({
        saleDate: new Date().toISOString().split('T')[0],
        totalOrders: '', totalRevenue: '', totalRefunds: '0',
        cancellations: '0', kitchenCost: '', grossProfit: '',
        netProfit: '', totalInvestment: '',
      });
      fetchSales();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await api.delete(`/api/sales/${id}`);
      fetchSales();
    }
  };

  // Aggregate weekly data
  const getWeeklyData = () => {
    const weekly = {};
    sales.forEach(s => {
      const date = new Date(s.saleDate);
      const week = `Week ${Math.ceil(date.getDate() / 7)} - ${
        date.toLocaleString('default', {month: 'short'})
      }`;
      if (!weekly[week]) {
        weekly[week] = {
          week, totalRevenue: 0, netProfit: 0, totalOrders: 0
        };
      }
      weekly[week].totalRevenue += parseFloat(s.totalRevenue || 0);
      weekly[week].netProfit += parseFloat(s.netProfit || 0);
      weekly[week].totalOrders += parseInt(s.totalOrders || 0);
    });
    return Object.values(weekly);
  };

  // Aggregate monthly data
  const getMonthlyData = () => {
    const monthly = {};
    sales.forEach(s => {
      const date = new Date(s.saleDate);
      const month = date.toLocaleString('default', {
        month: 'long', year: 'numeric'
      });
      if (!monthly[month]) {
        monthly[month] = {
          month, totalRevenue: 0, netProfit: 0, totalOrders: 0
        };
      }
      monthly[month].totalRevenue += parseFloat(s.totalRevenue || 0);
      monthly[month].netProfit += parseFloat(s.netProfit || 0);
      monthly[month].totalOrders += parseInt(s.totalOrders || 0);
    });
    return Object.values(monthly);
  };

  const totalRevenue = sales.reduce(
    (sum, s) => sum + parseFloat(s.totalRevenue || 0), 0
  );
  const totalProfit = sales.reduce(
    (sum, s) => sum + parseFloat(s.netProfit || 0), 0
  );
  const totalOrders = sales.reduce(
    (sum, s) => sum + parseInt(s.totalOrders || 0), 0
  );

  const isAdmin = user?.role === 'ADMIN';

  const chartData = activeView === 'daily'
    ? sales.map(s => ({
        date: s.saleDate,
        Revenue: parseFloat(s.totalRevenue || 0),
        Profit: parseFloat(s.netProfit || 0),
        Orders: parseInt(s.totalOrders || 0),
      }))
    : activeView === 'weekly'
    ? getWeeklyData().map(w => ({
        date: w.week,
        Revenue: parseFloat(w.totalRevenue.toFixed(2)),
        Profit: parseFloat(w.netProfit.toFixed(2)),
        Orders: w.totalOrders,
      }))
    : getMonthlyData().map(m => ({
        date: m.month,
        Revenue: parseFloat(m.totalRevenue.toFixed(2)),
        Profit: parseFloat(m.netProfit.toFixed(2)),
        Orders: m.totalOrders,
      }));

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
          onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          🚪 Logout
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 Sales Analytics</h1>
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
            <div style={{...styles.statValue, color:'#2ecc71'}}>
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
          {isAdmin && (
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Net Profit</div>
              <div style={{...styles.statValue, color:'#3498db'}}>
                ${totalProfit.toFixed(2)}
              </div>
            </div>
          )}
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Orders</div>
            <div style={{...styles.statValue, color:'#f5a623'}}>
              {totalOrders}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Avg Revenue/Day</div>
            <div style={{...styles.statValue, color:'#9b59b6'}}>
              ${sales.length > 0
                ? (totalRevenue / sales.length).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div style={styles.viewToggle}>
          {['daily','weekly','monthly'].map(view => (
            <button key={view}
              style={{
                ...styles.viewBtn,
                background: activeView === view ? '#f5a623' : 'white',
                color: activeView === view ? 'white' : '#333',
              }}
              onClick={() => setActiveView(view)}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>
              {activeView === 'daily' && '📅 Daily Sales'}
              {activeView === 'weekly' && '📅 Weekly Sales'}
              {activeView === 'monthly' && '📅 Monthly Sales'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{fontSize: 11}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Revenue" fill="#2ecc71" />
                {isAdmin && <Bar dataKey="Profit" fill="#3498db" />}
                <Bar dataKey="Orders" fill="#f5a623" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>Add Sales Record</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date</label>
                    <input style={styles.input} type="date"
                      value={form.saleDate}
                      onChange={e => setForm({...form, saleDate: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Orders</label>
                    <input style={styles.input} type="number"
                      value={form.totalOrders}
                      onChange={e => setForm({...form, totalOrders: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Revenue ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.totalRevenue}
                      onChange={e => setForm({...form, totalRevenue: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Refunds ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.totalRefunds}
                      onChange={e => setForm({...form, totalRefunds: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Kitchen Cost ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.kitchenCost}
                      onChange={e => setForm({...form, kitchenCost: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gross Profit ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.grossProfit}
                      onChange={e => setForm({...form, grossProfit: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Net Profit ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.netProfit}
                      onChange={e => setForm({...form, netProfit: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Investment ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.totalInvestment}
                      onChange={e => setForm({...form, totalInvestment: e.target.value})} />
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sales Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Orders</th>
                <th style={styles.th}>Revenue</th>
                <th style={styles.th}>Refunds</th>
                <th style={styles.th}>Kitchen Cost</th>
                {isAdmin && <th style={styles.th}>Net Profit</th>}
                {isAdmin && <th style={styles.th}>Investment</th>}
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.saleId} style={styles.tableRow}>
                  <td style={styles.td}><strong>{sale.saleDate}</strong></td>
                  <td style={styles.td}>{sale.totalOrders}</td>
                  <td style={styles.td}>
                    <strong style={{color:'#2ecc71'}}>
                      ${parseFloat(sale.totalRevenue || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    ${parseFloat(sale.totalRefunds || 0).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    ${parseFloat(sale.kitchenCost || 0).toFixed(2)}
                  </td>
                  {isAdmin && (
                    <td style={styles.td}>
                      <strong style={{color:'#3498db'}}>
                        ${parseFloat(sale.netProfit || 0).toFixed(2)}
                      </strong>
                    </td>
                  )}
                  {isAdmin && (
                    <td style={styles.td}>
                      ${parseFloat(sale.totalInvestment || 0).toFixed(2)}
                    </td>
                  )}
                  <td style={styles.td}>
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(sale.saleId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="8" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
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
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '25px',
  },
  statCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  statLabel: { color: '#888', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  viewToggle: {
    display: 'flex', gap: '10px', marginBottom: '20px',
    background: 'white', padding: '10px', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  viewBtn: {
    padding: '8px 20px', border: '2px solid #e0e0e0',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
  },
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
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default SalesManagement;