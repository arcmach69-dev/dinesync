import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    rowName: '', tableNumber: '', capacity: '', status: 'AVAILABLE',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/api/tables');
      setTables(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/tables/${editItem.tableId}`, form);
      } else {
        await api.post('/api/tables', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ rowName: '', tableNumber: '', capacity: '', status: 'AVAILABLE' });
      fetchTables();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this table?')) {
      await api.delete(`/api/tables/${id}`);
      fetchTables();
    }
  };

  const statusColors = {
    AVAILABLE: '#2ecc71', OCCUPIED: '#e74c3c', RESERVED: '#f5a623',
  };

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
            <h1 style={styles.title}>Table Management</h1>
            <p style={styles.subtitle}>{tables.length} tables total</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Table
          </button>
        </div>

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Table' : 'Add New Table'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Row Name</label>
                    <input style={styles.input} value={form.rowName} placeholder="A"
                      onChange={e => setForm({...form, rowName: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Table Number</label>
                    <input style={styles.input} value={form.tableNumber} placeholder="A1"
                      onChange={e => setForm({...form, tableNumber: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Capacity</label>
                    <input style={styles.input} type="number" value={form.capacity}
                      onChange={e => setForm({...form, capacity: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}>
                      {['AVAILABLE','OCCUPIED','RESERVED'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update Table' : 'Add Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div style={styles.tablesGrid}>
          {tables.map(table => (
            <div key={table.tableId} style={{
              ...styles.tableCard,
              borderTop: `5px solid ${statusColors[table.status]}`
            }}>
              <div style={styles.tableNumber}>Table {table.tableNumber}</div>
              <div style={styles.tableRow}>Row {table.rowName}</div>
              <div style={styles.tableCapacity}>👥 {table.capacity} seats</div>
              <span style={{
                ...styles.statusBadge,
                background: statusColors[table.status]
              }}>
                {table.status}
              </span>
              <div style={styles.tableActions}>
                <button style={styles.editBtn} onClick={() => handleEdit(table)}>
                  <FaEdit />
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(table.tableId)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          {tables.length === 0 && (
            <div style={styles.empty}>No tables added yet. Add your first table!</div>
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
    background: 'white', borderRadius: '16px', padding: '30px', width: '500px',
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
  tablesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
  },
  tableCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  tableNumber: { fontSize: '22px', fontWeight: '800', color: '#1a1a2e', marginBottom: '5px' },
  tableRow: { color: '#888', fontSize: '13px', marginBottom: '8px' },
  tableCapacity: { fontSize: '14px', color: '#555', marginBottom: '12px' },
  statusBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600', marginBottom: '15px',
  },
  tableActions: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  empty: { color: '#888', padding: '40px', gridColumn: '1/-1', textAlign: 'center' },
};

export default TableManagement;