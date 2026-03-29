import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    ingredientName: '', quantityAvailable: '',
    quantityUsed: '', minimumThreshold: '',
    unit: 'kg', alertSent: false,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setInventory(res.data);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setForm({
      ingredientName: '', quantityAvailable: '',
      quantityUsed: '', minimumThreshold: '',
      unit: 'kg', alertSent: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedItem;
      if (editItem) {
        const res = await api.put(
          `/api/inventory/${editItem.inventoryId}`, form);
        savedItem = res.data;
      } else {
        const res = await api.post('/api/inventory', form);
        savedItem = res.data;
      }

      // Auto low stock alert
      if (
        savedItem &&
        parseFloat(savedItem.quantityAvailable) <=
        parseFloat(savedItem.minimumThreshold)
      ) {
        try {
          await api.post('/api/email/low-stock', {
            to: 'manager@dinesync.com',
            ingredientName: savedItem.ingredientName,
            quantityLeft: parseFloat(savedItem.quantityAvailable),
            unit: savedItem.unit,
          });
          alert(
            `⚠️ Low stock alert sent for ${savedItem.ingredientName}!`
          );
        } catch (emailErr) {
          console.error('Alert email failed:', emailErr);
        }
      }

      setShowForm(false);
      setEditItem(null);
      resetForm();
      fetchInventory();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inventory item?')) {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
    }
  };

  const lowStockItems = inventory.filter(
    item => parseFloat(item.quantityAvailable) <=
            parseFloat(item.minimumThreshold)
  );

  const unitColors = {
    kg: '#3498db', liters: '#2ecc71',
    pieces: '#f5a623', grams: '#9b59b6',
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
          onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          🚪 Logout
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📦 Inventory Management</h1>
            <p style={styles.subtitle}>
              {inventory.length} items •
              <span style={{color:'#e74c3c'}}>
                {' '}{lowStockItems.length} low stock
              </span>
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Item
          </button>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div style={styles.alertBanner}>
            ⚠️ Low Stock Items:
            {lowStockItems.map(item => (
              <span key={item.inventoryId} style={styles.alertItem}>
                {item.ingredientName} ({item.quantityAvailable} {item.unit})
              </span>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div>
              <div style={{...styles.statValue, color:'#3498db'}}>
                {inventory.length}
              </div>
              <div style={styles.statLabel}>Total Items</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <div style={{...styles.statValue, color:'#2ecc71'}}>
                {inventory.length - lowStockItems.length}
              </div>
              <div style={styles.statLabel}>In Stock</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚠️</div>
            <div>
              <div style={{...styles.statValue, color:'#e74c3c'}}>
                {lowStockItems.length}
              </div>
              <div style={styles.statLabel}>Low Stock</div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
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
                    <input style={styles.input}
                      value={form.ingredientName}
                      placeholder="e.g. Chicken"
                      onChange={e => setForm({
                        ...form, ingredientName: e.target.value
                      })}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Unit</label>
                    <select style={styles.input} value={form.unit}
                      onChange={e => setForm({...form, unit: e.target.value})}>
                      {['kg','liters','pieces','grams'].map(u =>
                        <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity Available</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.quantityAvailable}
                      onChange={e => setForm({
                        ...form, quantityAvailable: e.target.value
                      })}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Quantity Used</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.quantityUsed}
                      onChange={e => setForm({
                        ...form, quantityUsed: e.target.value
                      })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Minimum Threshold
                      <span style={styles.thresholdHint}>
                        (alert sent below this)
                      </span>
                    </label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.minimumThreshold}
                      onChange={e => setForm({
                        ...form, minimumThreshold: e.target.value
                      })}
                      required />
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
                    {editItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inventory Table */}
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
              {inventory.map(item => {
                const isLow = parseFloat(item.quantityAvailable) <=
                              parseFloat(item.minimumThreshold);
                return (
                  <tr key={item.inventoryId} style={{
                    ...styles.tableRow,
                    background: isLow ? '#fff5f5' : 'white',
                  }}>
                    <td style={styles.td}>
                      <strong>{item.ingredientName}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: unitColors[item.unit] || '#888'
                      }}>
                        {item.unit}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{
                        color: isLow ? '#e74c3c' : '#2ecc71'
                      }}>
                        {item.quantityAvailable}
                      </strong>
                    </td>
                    <td style={styles.td}>{item.quantityUsed || 0}</td>
                    <td style={styles.td}>{item.minimumThreshold}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: isLow ? '#e74c3c' : '#2ecc71'
                      }}>
                        {isLow ? '⚠️ LOW' : '✅ OK'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn}
                        onClick={() => handleEdit(item)}>
                        <FaEdit />
                      </button>
                      <button style={styles.deleteBtn}
                        onClick={() => handleDelete(item.inventoryId)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="7" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
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
  alertBanner: {
    background: '#ffe0e0', border: '1px solid #e74c3c',
    borderRadius: '10px', padding: '12px 20px',
    marginBottom: '20px', fontSize: '14px', color: '#c0392b',
    fontWeight: '600', display: 'flex', flexWrap: 'wrap', gap: '10px',
    alignItems: 'center',
  },
  alertItem: {
    background: '#e74c3c', color: 'white', padding: '3px 10px',
    borderRadius: '20px', fontSize: '12px',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
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
    width: '580px', maxHeight: '80vh', overflow: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' },
  thresholdHint: { color: '#e74c3c', fontSize: '11px', marginLeft: '5px' },
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