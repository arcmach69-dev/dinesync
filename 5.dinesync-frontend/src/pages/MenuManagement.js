import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [form, setForm] = useState({
    dishName: '', category: 'MAIN_COURSE', spiceLevel: 'MILD',
    price: '', availability: 'AVAILABLE', stockQuantity: '',
    variant: '', imageUrl: '',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

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
      resetForm();
      fetchMenuItems();
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setForm({
      dishName: '', category: 'MAIN_COURSE', spiceLevel: 'MILD',
      price: '', availability: 'AVAILABLE', stockQuantity: '',
      variant: '', imageUrl: '',
    });
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

  const toggleAvailability = async (item) => {
    await api.put(`/api/menu-items/${item.itemId}`, {
      ...item,
      availability: item.availability === 'AVAILABLE'
        ? 'NOT_AVAILABLE' : 'AVAILABLE'
    });
    fetchMenuItems();
  };

  const categoryColors = {
    MAIN_COURSE: '#e74c3c', STARTER: '#f5a623',
    DESSERT: '#9b59b6', DRINKS: '#3498db', SIDES: '#2ecc71',
  };

  const spiceEmoji = {
    MILD: '🟢', MEDIUM: '🟡', HIGH: '🔴', NOT_APPLICABLE: '⚪',
  };

  const categories = ['ALL', 'MAIN_COURSE', 'STARTER', 'DESSERT', 'DRINKS', 'SIDES'];

  const filtered = filterCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category === filterCategory);

  const defaultImages = {
    MAIN_COURSE: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    STARTER: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    DESSERT: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
    DRINKS: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    SIDES: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
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
            <h1 style={styles.title}>🍽️ Menu Management</h1>
            <p style={styles.subtitle}>{menuItems.length} items on menu</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.viewToggle}>
              <button
                style={viewMode === 'grid' ? styles.viewBtnActive : styles.viewBtn}
                onClick={() => setViewMode('grid')}>⊞ Grid</button>
              <button
                style={viewMode === 'table' ? styles.viewBtnActive : styles.viewBtn}
                onClick={() => setViewMode('table')}>☰ Table</button>
            </div>
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              <FaPlus /> Add Item
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div style={styles.categoryFilter}>
          {categories.map(cat => (
            <button key={cat}
              style={{
                ...styles.catBtn,
                background: filterCategory === cat
                  ? (categoryColors[cat] || '#1a1a2e') : 'white',
                color: filterCategory === cat ? 'white' : '#333',
                borderColor: categoryColors[cat] || '#1a1a2e',
              }}
              onClick={() => setFilterCategory(cat)}>
              {cat === 'ALL' ? '🍴 All Items' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div style={styles.menuGrid}>
            {filtered.map(item => (
              <div key={item.itemId} style={{
                ...styles.menuCard,
                opacity: item.availability === 'NOT_AVAILABLE' ? 0.7 : 1,
              }}>
                {/* Image */}
                <div style={styles.imageWrapper}>
                  <img
                    src={item.imageUrl || defaultImages[item.category]}
                    alt={item.dishName}
                    style={styles.menuImage}
                    onError={e => {
                      e.target.src = defaultImages[item.category] ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                    }}
                  />
                  <div style={{
                    ...styles.categoryBadge,
                    background: categoryColors[item.category]
                  }}>
                    {item.category.replace('_', ' ')}
                  </div>
                  {item.availability === 'NOT_AVAILABLE' && (
                    <div style={styles.unavailableOverlay}>UNAVAILABLE</div>
                  )}
                </div>

                {/* Content */}
                <div style={styles.cardContent}>
                  <div style={styles.cardTop}>
                    <h3 style={styles.dishName}>{item.dishName}</h3>
                    <span style={styles.price}>
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>

                  {item.variant && (
                    <p style={styles.variant}>📦 {item.variant}</p>
                  )}

                  <div style={styles.cardMeta}>
                    <span style={styles.spice}>
                      {spiceEmoji[item.spiceLevel]} {item.spiceLevel}
                    </span>
                    <span style={{
                      ...styles.stock,
                      color: item.stockQuantity < 10 ? '#e74c3c' : '#2ecc71'
                    }}>
                      Stock: {item.stockQuantity}
                    </span>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      style={{
                        ...styles.availBtn,
                        background: item.availability === 'AVAILABLE'
                          ? '#2ecc71' : '#e74c3c'
                      }}
                      onClick={() => toggleAvailability(item)}>
                      {item.availability === 'AVAILABLE' ? '✅ Available' : '❌ Unavailable'}
                    </button>
                    <div style={styles.iconBtns}>
                      <button style={styles.editIconBtn}
                        onClick={() => handleEdit(item)}>
                        <FaEdit />
                      </button>
                      <button style={styles.deleteIconBtn}
                        onClick={() => handleDelete(item.itemId)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div style={styles.addCard} onClick={() => setShowForm(true)}>
              <div style={styles.addCardIcon}>+</div>
              <div style={styles.addCardText}>Add New Item</div>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div style={styles.tableBox}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Dish Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Spice</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Availability</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.itemId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <img
                        src={item.imageUrl || defaultImages[item.category]}
                        alt={item.dishName}
                        style={styles.tableImage}
                        onError={e => {
                          e.target.src = defaultImages[item.category];
                        }}
                      />
                    </td>
                    <td style={styles.td}>
                      <strong>{item.dishName}</strong>
                      {item.variant && (
                        <div style={{fontSize:'12px', color:'#888'}}>
                          {item.variant}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: categoryColors[item.category]
                      }}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{color:'#2ecc71'}}>
                        ${parseFloat(item.price).toFixed(2)}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      {spiceEmoji[item.spiceLevel]} {item.spiceLevel}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        color: item.stockQuantity < 10 ? '#e74c3c' : '#2ecc71',
                        fontWeight: '700'
                      }}>
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.availBtnSmall,
                          background: item.availability === 'AVAILABLE'
                            ? '#2ecc71' : '#e74c3c'
                        }}
                        onClick={() => toggleAvailability(item)}>
                        {item.availability === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn}
                        onClick={() => handleEdit(item)}>
                        <FaEdit />
                      </button>
                      <button style={styles.deleteBtn}
                        onClick={() => handleDelete(item.itemId)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORM MODAL */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}
              </h2>

              {/* Image Preview */}
              {form.imageUrl && (
                <div style={styles.imagePreview}>
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    style={styles.previewImg}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={{...styles.formGroup, gridColumn: '1/-1'}}>
                    <label style={styles.label}>Dish Name *</label>
                    <input style={styles.input}
                      placeholder="e.g. Chicken Biryani"
                      value={form.dishName}
                      onChange={e => setForm({...form, dishName: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select style={styles.input} value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}>
                      {['MAIN_COURSE','STARTER','DESSERT','DRINKS','SIDES'].map(c =>
                        <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Spice Level *</label>
                    <select style={styles.input} value={form.spiceLevel}
                      onChange={e => setForm({...form, spiceLevel: e.target.value})}>
                      {['MILD','MEDIUM','HIGH','NOT_APPLICABLE'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price ($) *</label>
                    <input style={styles.input} type="number" step="0.01"
                      placeholder="e.g. 14.99"
                      value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Quantity *</label>
                    <input style={styles.input} type="number"
                      placeholder="e.g. 50"
                      value={form.stockQuantity}
                      onChange={e => setForm({...form, stockQuantity: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Variant</label>
                    <input style={styles.input}
                      placeholder="e.g. Full Plate, Half, 2 pieces"
                      value={form.variant}
                      onChange={e => setForm({...form, variant: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Availability</label>
                    <select style={styles.input} value={form.availability}
                      onChange={e => setForm({...form, availability: e.target.value})}>
                      {['AVAILABLE','NOT_AVAILABLE'].map(a =>
                        <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div style={{...styles.formGroup, gridColumn: '1/-1'}}>
                    <label style={styles.label}>
                      Image URL
                      <span style={styles.labelHint}>
                        — paste any image URL from Google Images or Unsplash
                      </span>
                    </label>
                    <input style={styles.input}
                      placeholder="https://images.unsplash.com/photo-..."
                      value={form.imageUrl}
                      onChange={e => setForm({...form, imageUrl: e.target.value})} />
                  </div>

                  {/* Quick image suggestions */}
                  <div style={{...styles.formGroup, gridColumn: '1/-1'}}>
                    <label style={styles.label}>Quick Image Suggestions:</label>
                    <div style={styles.quickImages}>
                      {[
                        { name: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
                        { name: 'Tikka', url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
                        { name: 'Curry', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
                        { name: 'Dessert', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
                        { name: 'Drink', url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400' },
                        { name: 'Naan', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400' },
                      ].map(img => (
                        <div key={img.name} style={styles.quickImg}
                          onClick={() => setForm({...form, imageUrl: img.url})}>
                          <img src={img.url} alt={img.name}
                            style={styles.quickImgPhoto} />
                          <span style={styles.quickImgName}>{img.name}</span>
                        </div>
                      ))}
                    </div>
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
                    {editItem ? '✅ Update Item' : '➕ Add to Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
    marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  subtitle: { color: '#888', margin: '4px 0 0', fontSize: '14px' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  viewToggle: {
    display: 'flex', background: '#f0f2f5', borderRadius: '8px', padding: '3px',
  },
  viewBtn: {
    padding: '6px 14px', background: 'transparent', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#888',
  },
  viewBtnActive: {
    padding: '6px 14px', background: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
    color: '#1a1a2e', fontWeight: '600', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  categoryFilter: {
    display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap',
  },
  catBtn: {
    padding: '8px 18px', border: '2px solid #e0e0e0',
    borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
    fontWeight: '600', transition: 'all 0.2s',
  },
  menuGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
  },
  menuCard: {
    background: 'white', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imageWrapper: { position: 'relative', height: '180px', overflow: 'hidden' },
  menuImage: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  categoryBadge: {
    position: 'absolute', top: '10px', left: '10px',
    padding: '4px 10px', borderRadius: '20px', color: 'white',
    fontSize: '10px', fontWeight: '700',
  },
  unavailableOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: '800', fontSize: '14px',
    letterSpacing: '2px',
  },
  cardContent: { padding: '15px' },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '6px',
  },
  dishName: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: 0, flex: 1 },
  price: { fontSize: '18px', fontWeight: '800', color: '#2ecc71', marginLeft: '8px' },
  variant: { fontSize: '12px', color: '#888', margin: '0 0 8px' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  spice: { fontSize: '12px', color: '#555' },
  stock: { fontSize: '12px', fontWeight: '600' },
  cardActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  availBtn: {
    padding: '6px 12px', border: 'none', borderRadius: '6px',
    color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
  },
  iconBtns: { display: 'flex', gap: '6px' },
  editIconBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  deleteIconBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  addCard: {
    background: 'white', borderRadius: '16px', border: '2px dashed #e0e0e0',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', minHeight: '280px',
    transition: 'all 0.2s',
  },
  addCardIcon: { fontSize: '48px', color: '#f5a623', marginBottom: '10px' },
  addCardText: { fontSize: '14px', color: '#888', fontWeight: '600' },
  tableBox: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '12px 20px', fontSize: '14px', color: '#333' },
  tableImage: {
    width: '55px', height: '45px', objectFit: 'cover',
    borderRadius: '8px',
  },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '11px', fontWeight: '600',
  },
  availBtnSmall: {
    padding: '4px 10px', border: 'none', borderRadius: '20px',
    color: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
  },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '680px', maxHeight: '88vh', overflow: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  imagePreview: {
    marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', height: '160px',
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' },
  labelHint: { fontSize: '11px', color: '#888', fontWeight: '400', marginLeft: '5px' },
  input: {
    padding: '10px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  quickImages: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  quickImg: {
    cursor: 'pointer', textAlign: 'center', border: '2px solid #e0e0e0',
    borderRadius: '8px', overflow: 'hidden', width: '80px',
  },
  quickImgPhoto: { width: '80px', height: '60px', objectFit: 'cover' },
  quickImgName: { fontSize: '10px', color: '#555', padding: '3px', display: 'block' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 20px', background: '#f5a623', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
};

export default MenuManagement;