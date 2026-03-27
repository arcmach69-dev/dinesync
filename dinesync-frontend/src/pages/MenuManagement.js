import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    dishName: '', category: 'MAIN_COURSE', spiceLevel: 'MILD',
    price: '', availability: 'AVAILABLE', stockQuantity: '',
    variant: '', imageUrl: '',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('/api/menu-items');
      setMenuItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/menu-items/${editItem.itemId}`, form);
      } else {
        await api.post('/api/menu-items', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ dishName: '', category: 'MAIN_COURSE', spiceLevel: 'MILD',
        price: '', availability: 'AVAILABLE', stockQuantity: '', variant: '', imageUrl: '' });
      fetchMenuItems();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      await api.delete(`/api/menu-items/${id}`);
      fetchMenuItems();
    }
  };

  const categoryColors = {
    MAIN_COURSE: '#e74c3c', STARTER: '#f5a623',
    DESSERT: '#9b59b6', DRINKS: '#3498db', SIDES: '#2ecc71',
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
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

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Menu Management</h1>
            <p style={styles.subtitle}>{menuItems.length} items on menu</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add New Item
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Dish Name</label>
                    <input style={styles.input} value={form.dishName}
                      onChange={e => setForm({...form, dishName: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select style={styles.input} value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}>
                      {['MAIN_COURSE','STARTER','DESSERT','DRINKS','SIDES'].map(c =>
                        <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price ($)</label>
                    <input style={styles.input} type="number" step="0.01" value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Spice Level</label>
                    <select style={styles.input} value={form.spiceLevel}
                      onChange={e => setForm({...form, spiceLevel: e.target.value})}>
                      {['MILD','MEDIUM','HIGH','NOT_APPLICABLE'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Quantity</label>
                    <input style={styles.input} type="number" value={form.stockQuantity}
                      onChange={e => setForm({...form, stockQuantity: e.target.value})} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Availability</label>
                    <select style={styles.input} value={form.availability}
                      onChange={e => setForm({...form, availability: e.target.value})}>
                      {['AVAILABLE','NOT_AVAILABLE'].map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Variant (optional)</label>
                    <input style={styles.input} value={form.variant}
                      onChange={e => setForm({...form, variant: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Image URL (optional)</label>
                    <input style={styles.input} value={form.imageUrl}
                      onChange={e => setForm({...form, imageUrl: e.target.value})} />
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setEditItem(null); }}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Items Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Dish Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Spice Level</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Availability</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.itemId} style={styles.tableRow}>
                  <td style={styles.td}><strong>{item.dishName}</strong></td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: categoryColors[item.category]}}>
                      {item.category}
                    </span>
                  </td>
                  <td style={styles.td}>${item.price}</td>
                  <td style={styles.td}>{item.spiceLevel}</td>
                  <td style={styles.td}>{item.stockQuantity}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge,
                      background: item.availability === 'AVAILABLE' ? '#2ecc71' : '#e74c3c'}}>
                      {item.availability}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(item.itemId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
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
    padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '8px',
    fontSize: '14px', outline: 'none',
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
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600' },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default MenuManagement;