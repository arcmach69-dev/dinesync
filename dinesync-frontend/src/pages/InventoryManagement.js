import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    ingredientName: '', unit: '', quantityAvailable: '',
    quantityUsed: '', minimumThreshold: '', alertSent: false,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setInventory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/inventory/${editItem.inventoryId}`, form);
      } else {
        await api.post('/api/inventory', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ ingredientName: '', unit: '', quantityAvailable: '',
        quantityUsed: '', minimumThreshold: '', alertSent: false });
      fetchInventory();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
    }
  };

  const isLowStock = (item) =>
    parseFloat(item.quantityAvailable) <= parseFloat(item.minimumThreshold);

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
            <h1 style={styles.title}>Inventory Management</h1>
            <p style={styles.subtitle}>
              {inventory.length} items •
              <span style={{color:'#e74c3c'}}> {inventory.filter(isLowStock).length} low stock</span>
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Item
          </button>
        </div>

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Ingredient Name</label>
                    <input style={styles.input} value={form.ingredientName}
                      onChange={e => setForm({...form, ingredientName: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Unit</label>
                    <input style={styles.input} value={form.unit} placeholder="kg, liters, pieces"
                      onChange={e => setForm({...form, unit: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity Available</label>
                    <input style={styles.input} type="number" step="0.01" value={form.quantityAvailable}
                      onChange={e => setForm({...form, quantityAvailable: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity Used</label>
                    <input style={styles.input} type="number" step="0.01" value={form.quantityUsed}
                      onChange={e => setForm({...form, quantityUsed: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Minimum Threshold</label>
                    <input style={styles.input} type="number" step="0.01" value={form.minimumThreshold}
                      onChange={e => setForm({...form, minimumThreshold: e.target.value})} required />
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update' : 'Add Item'}
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
                <th style={styles.th}>Ingredient</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Used</th>
                <th style={styles.th}>Min Threshold</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.inventoryId}
                  style={{...styles.tableRow,
                    background: isLowStock(item) ? '#fff5f5' : 'white'}}>
                  <td style={styles.td}>
                    <strong>{item.ingredientName}</strong>
                    {isLowStock(item) &&
                      <FaExclamationTriangle style={{color:'#e74c3c', marginLeft:'8px'}} />}
                  </td>
                  <td style={styles.td}>{item.unit}</td>
                  <td style={styles.td}>{item.quantityAvailable}</td>
                  <td style={styles.td}>{item.quantityUsed}</td>
                  <td style={styles.td}>{item.minimumThreshold}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: isLowStock(item) ? '#e74c3c' : '#2ecc71'
                    }}>
                      {isLowStock(item) ? 'LOW STOCK' : 'OK'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(item.inventoryId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="7" style={{...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'}}>
                    No inventory items yet.
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
    background: 'white', borderRadius: '16px', padding: '30px', width: '550px',
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
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default InventoryManagement;