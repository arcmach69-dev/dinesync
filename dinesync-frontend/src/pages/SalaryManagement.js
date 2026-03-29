import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleNavigation } from '../context/useRoleNavigation';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaCheck, FaTrash } from 'react-icons/fa';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: '', role: 'MANAGER', fullName: '',
    baseSalary: '', month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), status: 'PENDING',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  useEffect(() => { fetchSalaries(); }, []);

  const fetchSalaries = async () => {
    try {
      const res = await api.get('/api/salaries');
      setSalaries(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/salaries', form);
      setShowForm(false);
      setForm({
        userId: '', role: 'MANAGER', fullName: '',
        baseSalary: '', month: new Date().getMonth() + 1,
        year: new Date().getFullYear(), status: 'PENDING',
      });
      fetchSalaries();
    } catch (err) { console.error(err); }
  };

  const markAsPaid = async (salary) => {
    try {
      await api.put(`/api/salaries/${salary.salaryId}`, {
        ...salary, status: 'PAID'
      });
      fetchSalaries();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this salary record?')) {
      await api.delete(`/api/salaries/${id}`);
      fetchSalaries();
    }
  };

  const defaultSalaries = {
    MANAGER: 8000, KITCHEN_STAFF: 5000, WAITER: 3000,
  };

  const totalPayroll = salaries.reduce(
    (sum, s) => sum + parseFloat(s.baseSalary || 0), 0
  );
  const totalPaid = salaries
    .filter(s => s.status === 'PAID')
    .reduce((sum, s) => sum + parseFloat(s.baseSalary || 0), 0);
  const totalPending = salaries
    .filter(s => s.status === 'PENDING')
    .reduce((sum, s) => sum + parseFloat(s.baseSalary || 0), 0);

  const roleColors = {
    MANAGER: '#3498db', KITCHEN_STAFF: '#e74c3c', WAITER: '#2ecc71',
  };

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
            <h1 style={styles.title}>💰 Staff Salary Management</h1>
            <p style={styles.subtitle}>{salaries.length} salary records</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Salary Record
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Monthly Payroll</div>
            <div style={{...styles.statValue, color: '#1a1a2e'}}>
              ${totalPayroll.toLocaleString()}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Paid</div>
            <div style={{...styles.statValue, color: '#2ecc71'}}>
              ${totalPaid.toLocaleString()}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Pending</div>
            <div style={{...styles.statValue, color: '#e74c3c'}}>
              ${totalPending.toLocaleString()}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Staff Count</div>
            <div style={{...styles.statValue, color: '#3498db'}}>
              {salaries.length}
            </div>
          </div>
        </div>

        {/* Default Salary Reference */}
        <div style={styles.referenceBox}>
          <h3 style={styles.refTitle}>Default Salary Structure</h3>
          <div style={styles.refGrid}>
            {Object.entries(defaultSalaries).map(([role, amount]) => (
              <div key={role} style={{
                ...styles.refCard,
                borderLeft: `4px solid ${roleColors[role]}`
              }}>
                <div style={{color: roleColors[role], fontWeight: '700'}}>
                  {role}
                </div>
                <div style={styles.refAmount}>${amount.toLocaleString()}/month</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>Add Salary Record</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} value={form.fullName}
                      onChange={e => setForm({...form, fullName: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select style={styles.input} value={form.role}
                      onChange={e => setForm({
                        ...form,
                        role: e.target.value,
                        baseSalary: defaultSalaries[e.target.value] || ''
                      })}>
                      {['MANAGER','KITCHEN_STAFF','WAITER'].map(r =>
                        <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>User ID</label>
                    <input style={styles.input} type="number"
                      value={form.userId}
                      onChange={e => setForm({...form, userId: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Base Salary ($)</label>
                    <input style={styles.input} type="number"
                      value={form.baseSalary}
                      onChange={e => setForm({...form, baseSalary: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Month</label>
                    <select style={styles.input} value={form.month}
                      onChange={e => setForm({...form, month: e.target.value})}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
                        <option key={m} value={m}>
                          {new Date(2026, m-1).toLocaleString('default',
                            {month: 'long'})}
                        </option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year</label>
                    <input style={styles.input} type="number"
                      value={form.year}
                      onChange={e => setForm({...form, year: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}>
                      {['PENDING','PAID'].map(s => <option key={s}>{s}</option>)}
                    </select>
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

        {/* Salary Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Base Salary</th>
                <th style={styles.th}>Month/Year</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(salary => (
                <tr key={salary.salaryId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{salary.fullName}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: roleColors[salary.role] || '#888'
                    }}>
                      {salary.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong style={{color:'#1a1a2e'}}>
                      ${parseFloat(salary.baseSalary).toLocaleString()}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    {new Date(salary.year, salary.month - 1)
                      .toLocaleString('default', {month: 'long'})} {salary.year}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: salary.status === 'PAID' ? '#2ecc71' : '#e74c3c'
                    }}>
                      {salary.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {salary.status === 'PENDING' && (
                      <button style={styles.payBtn}
                        onClick={() => markAsPaid(salary)}>
                        <FaCheck /> Mark Paid
                      </button>
                    )}
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(salary.salaryId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {salaries.length === 0 && (
                <tr>
                  <td colSpan="6" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
                    No salary records yet.
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
  referenceBox: {
    background: 'white', borderRadius: '12px', padding: '20px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  refTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '15px' },
  refGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  refCard: {
    padding: '15px', background: '#f8f9fa',
    borderRadius: '8px', textAlign: 'center',
  },
  refAmount: { fontSize: '20px', fontWeight: '800', color: '#1a1a2e', marginTop: '5px' },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '580px', maxHeight: '85vh', overflow: 'auto',
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
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  payBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: '#2ecc71', color: 'white', border: 'none',
    padding: '7px 12px', borderRadius: '6px', cursor: 'pointer',
    marginRight: '5px', fontSize: '13px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default SalaryManagement;