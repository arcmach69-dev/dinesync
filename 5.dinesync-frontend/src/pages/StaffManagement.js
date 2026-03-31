import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phoneNumber: '', role: 'WAITER',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/api/users');
      setStaff(res.data.filter(u => u.role !== 'ADMIN'));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/users/${editItem.userId}`, form);
      } else {
        await api.post('/api/users', form);
      }
      setShowForm(false);
      setEditItem(null);
      resetForm();
      fetchStaff();
    } catch (err) {
      alert('Failed to save. Email may already exist.');
    }
  };

  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', email: '',
      password: '', phoneNumber: '', role: 'WAITER',
    });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      password: '',
      phoneNumber: item.phoneNumber,
      role: item.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this staff member?')) {
      await api.delete(`/api/users/${id}`);
      fetchStaff();
    }
  };

  const roleColors = {
    MANAGER: '#3498db', WAITER: '#2ecc71',
    KITCHEN_STAFF: '#e74c3c', CUSTOMER: '#9b59b6',
  };

  const roleEmoji = {
    MANAGER: '📊', WAITER: '🍽️',
    KITCHEN_STAFF: '👨‍🍳', CUSTOMER: '🛒',
  };

  const managerCount = staff.filter(s => s.role === 'MANAGER').length;
  const waiterCount = staff.filter(s => s.role === 'WAITER').length;
  const kitchenCount = staff.filter(s => s.role === 'KITCHEN_STAFF').length;
  const customerCount = staff.filter(s => s.role === 'CUSTOMER').length;

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
            <h1 style={styles.title}>👥 Staff Management</h1>
            <p style={styles.subtitle}>{staff.length} staff members</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Staff Member
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={{...styles.statValue, color:'#3498db'}}>
                {managerCount}
              </div>
              <div style={styles.statLabel}>Managers</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🍽️</div>
            <div>
              <div style={{...styles.statValue, color:'#2ecc71'}}>
                {waiterCount}
              </div>
              <div style={styles.statLabel}>Waiters</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍🍳</div>
            <div>
              <div style={{...styles.statValue, color:'#e74c3c'}}>
                {kitchenCount}
              </div>
              <div style={styles.statLabel}>Kitchen Staff</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🛒</div>
            <div>
              <div style={{...styles.statValue, color:'#9b59b6'}}>
                {customerCount}
              </div>
              <div style={styles.statLabel}>Customers</div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Name</label>
                    <input style={styles.input}
                      value={form.firstName}
                      onChange={e => setForm({...form, firstName: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input style={styles.input}
                      value={form.lastName}
                      onChange={e => setForm({...form, lastName: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input style={styles.input} type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Password {editItem && '(leave blank to keep)'}
                    </label>
                    <input style={styles.input} type="password"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      required={!editItem} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input style={styles.input}
                      placeholder="(555) 123-4567"
                      value={form.phoneNumber}
                      maxLength={14}
                      onChange={e => {
                        const input = e.target.value.replace(/\D/g, '');
                        let formatted = '';
                        if (input.length === 0) formatted = '';
                        else if (input.length <= 3) formatted = `(${input}`;
                        else if (input.length <= 6) formatted = `(${input.slice(0,3)}) ${input.slice(3)}`;
                        else formatted = `(${input.slice(0,3)}) ${input.slice(3,6)}-${input.slice(6,10)}`;
                        setForm({...form, phoneNumber: formatted});
                      }}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select style={styles.input} value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}>
                      {['MANAGER','WAITER','KITCHEN_STAFF','CUSTOMER'].map(r =>
                        <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => {
                      setShowForm(false);
                      setEditItem(null);
                      resetForm();
                    }}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update Staff' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.userId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={{
                        ...styles.avatar,
                        background: roleColors[member.role] || '#888'
                      }}>
                        {roleEmoji[member.role]}
                      </div>
                      <div>
                        <strong>
                          {member.firstName} {member.lastName}
                        </strong>
                        <div style={styles.userId}>
                          ID: {member.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{member.email}</td>
                  <td style={styles.td}>
                    {member.phoneNumber || '—'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: roleColors[member.role] || '#888'
                    }}>
                      {roleEmoji[member.role]} {member.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn}
                      onClick={() => handleEdit(member)}>
                      <FaEdit />
                    </button>
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(member.userId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
                    No staff members yet.
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
    display: 'flex', alignItems: 'center', gap: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statIcon: { fontSize: '32px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  statLabel: { color: '#888', fontSize: '13px' },
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
  nameCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  userId: { fontSize: '12px', color: '#aaa', marginTop: '2px' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default StaffManagement;