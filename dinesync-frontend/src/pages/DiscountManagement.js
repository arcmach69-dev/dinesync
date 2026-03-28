import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [couponCheck, setCouponCheck] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [form, setForm] = useState({
    type: 'OFFER', title: '', description: '',
    discountPercent: '', discountAmount: '',
    minimumOrder: '', validFrom: '', validUntil: '',
    applicableTo: 'EVERYONE', usageLimit: '',
    isActive: true, couponCode: '', createdBy: 1,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchDiscounts(); }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/api/discounts');
      setDiscounts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/discounts/${editItem.discountId}`, form);
      } else {
        await api.post('/api/discounts', form);
      }
      setShowForm(false);
      setEditItem(null);
      resetForm();
      fetchDiscounts();
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setForm({
      type: 'OFFER', title: '', description: '',
      discountPercent: '', discountAmount: '',
      minimumOrder: '', validFrom: '', validUntil: '',
      applicableTo: 'EVERYONE', usageLimit: '',
      isActive: true, couponCode: '', createdBy: 1,
    });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this discount?')) {
      await api.delete(`/api/discounts/${id}`);
      fetchDiscounts();
    }
  };

  const handleToggle = async (item) => {
    await api.put(`/api/discounts/${item.discountId}`, {
      ...item, isActive: !item.isActive
    });
    fetchDiscounts();
  };

  const checkCoupon = async () => {
    try {
      const res = await api.get(`/api/discounts/coupon/${couponCheck}`);
      setCouponResult({ found: true, data: res.data });
    } catch (err) {
      setCouponResult({ found: false });
    }
  };

  const activeOffers = discounts.filter(
    d => d.type === 'OFFER' && d.isActive
  );
  const activeCoupons = discounts.filter(
    d => d.type === 'COUPON' && d.isActive
  );

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
            <h1 style={styles.title}>🎟️ Discounts & Coupons</h1>
            <p style={styles.subtitle}>
              {activeOffers.length} active offers •
              {activeCoupons.length} active coupons
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FaPlus /> Add Discount
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎁</div>
            <div>
              <div style={styles.statValue}>{activeOffers.length}</div>
              <div style={styles.statLabel}>Active Offers</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎟️</div>
            <div>
              <div style={styles.statValue}>{activeCoupons.length}</div>
              <div style={styles.statLabel}>Active Coupons</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={styles.statValue}>
                {discounts.reduce((sum, d) => sum + (d.usageCount || 0), 0)}
              </div>
              <div style={styles.statLabel}>Total Redemptions</div>
            </div>
          </div>
        </div>

        {/* Coupon Checker */}
        <div style={styles.couponChecker}>
          <h3 style={styles.checkerTitle}>🔍 Validate Coupon Code</h3>
          <div style={styles.checkerRow}>
            <input
              style={styles.checkerInput}
              placeholder="Enter coupon code..."
              value={couponCheck}
              onChange={e => {
                setCouponCheck(e.target.value);
                setCouponResult(null);
              }}
            />
            <button style={styles.checkerBtn} onClick={checkCoupon}>
              Validate
            </button>
          </div>
          {couponResult && (
            <div style={{
              ...styles.couponResult,
              background: couponResult.found ? '#e8f8f0' : '#ffe0e0',
              color: couponResult.found ? '#2ecc71' : '#e74c3c',
            }}>
              {couponResult.found ? (
                <span>
                  ✅ Valid! "{couponResult.data.title}" —
                  {couponResult.data.discountPercent
                    ? ` ${couponResult.data.discountPercent}% off`
                    : ` $${couponResult.data.discountAmount} off`}
                  {' '}(Min order: ${couponResult.data.minimumOrder})
                </span>
              ) : (
                <span>❌ Invalid or expired coupon code</span>
              )}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? 'Edit Discount' : 'Add Discount/Coupon'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Type</label>
                    <select style={styles.input} value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="OFFER">OFFER</option>
                      <option value="COUPON">COUPON</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Title</label>
                    <input style={styles.input} value={form.title}
                      placeholder="Festival Special"
                      onChange={e => setForm({...form, title: e.target.value})}
                      required />
                  </div>
                  <div style={{...styles.formGroup, gridColumn: '1/-1'}}>
                    <label style={styles.label}>Description</label>
                    <input style={styles.input} value={form.description}
                      placeholder="Get 20% off on all orders above $50"
                      onChange={e => setForm({...form, description: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Discount % (or leave blank)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.discountPercent}
                      placeholder="e.g. 20"
                      onChange={e => setForm({...form, discountPercent: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Flat Amount $ (or leave blank)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.discountAmount}
                      placeholder="e.g. 10"
                      onChange={e => setForm({...form, discountAmount: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Minimum Order ($)</label>
                    <input style={styles.input} type="number" step="0.01"
                      value={form.minimumOrder}
                      onChange={e => setForm({...form, minimumOrder: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Applicable To</label>
                    <select style={styles.input} value={form.applicableTo}
                      onChange={e => setForm({...form, applicableTo: e.target.value})}>
                      <option value="EVERYONE">EVERYONE</option>
                      <option value="REGISTERED">REGISTERED</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Valid From</label>
                    <input style={styles.input} type="date"
                      value={form.validFrom}
                      onChange={e => setForm({...form, validFrom: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Valid Until</label>
                    <input style={styles.input} type="date"
                      value={form.validUntil}
                      onChange={e => setForm({...form, validUntil: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Usage Limit</label>
                    <input style={styles.input} type="number"
                      value={form.usageLimit}
                      placeholder="100"
                      onChange={e => setForm({...form, usageLimit: e.target.value})} />
                  </div>
                  {form.type === 'COUPON' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Coupon Code</label>
                      <input style={styles.input} value={form.couponCode}
                        placeholder="SAVE20"
                        onChange={e => setForm({
                          ...form,
                          couponCode: e.target.value.toUpperCase()
                        })} />
                    </div>
                  )}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.isActive}
                      onChange={e => setForm({
                        ...form, isActive: e.target.value === 'true'
                      })}>
                      <option value="true">ACTIVE</option>
                      <option value="false">INACTIVE</option>
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
                    {editItem ? 'Update' : 'Add Discount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Discounts Table */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Discount</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Min Order</th>
                <th style={styles.th}>Valid Until</th>
                <th style={styles.th}>Used</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(item => (
                <tr key={item.discountId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{item.title}</strong>
                    {item.description && (
                      <div style={styles.descText}>{item.description}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: item.type === 'OFFER' ? '#f5a623' : '#9b59b6'
                    }}>
                      {item.type === 'OFFER' ? '🎁 OFFER' : '🎟️ COUPON'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong style={{color:'#2ecc71'}}>
                      {item.discountPercent
                        ? `${item.discountPercent}%`
                        : `$${item.discountAmount}`}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    {item.couponCode ? (
                      <span style={styles.couponCode}>{item.couponCode}</span>
                    ) : '—'}
                  </td>
                  <td style={styles.td}>
                    ${item.minimumOrder || '0'}
                  </td>
                  <td style={styles.td}>{item.validUntil}</td>
                  <td style={styles.td}>
                    {item.usageCount || 0}
                    {item.usageLimit ? `/${item.usageLimit}` : ''}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: item.isActive ? '#2ecc71' : '#e74c3c'
                    }}>
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.toggleBtn}
                      onClick={() => handleToggle(item)}
                      title={item.isActive ? 'Deactivate' : 'Activate'}>
                      {item.isActive
                        ? <FaToggleOn style={{color:'#2ecc71'}} />
                        : <FaToggleOff style={{color:'#e74c3c'}} />}
                    </button>
                    <button style={styles.editBtn}
                      onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button style={styles.deleteBtn}
                      onClick={() => handleDelete(item.discountId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && (
                <tr>
                  <td colSpan="9" style={{
                    ...styles.td, textAlign:'center',
                    color:'#888', padding:'40px'
                  }}>
                    No discounts yet. Create your first offer!
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
    display: 'flex', alignItems: 'center', gap: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statIcon: { fontSize: '36px' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { color: '#888', fontSize: '13px' },
  couponChecker: {
    background: 'white', borderRadius: '12px', padding: '20px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  checkerTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '15px' },
  checkerRow: { display: 'flex', gap: '10px' },
  checkerInput: {
    flex: 1, padding: '10px 15px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    textTransform: 'uppercase',
  },
  checkerBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
  },
  couponResult: {
    marginTop: '10px', padding: '10px 15px',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '650px', maxHeight: '85vh', overflow: 'auto',
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
  descText: { fontSize: '12px', color: '#888', marginTop: '3px' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  couponCode: {
    background: '#f0f2f5', padding: '4px 10px',
    borderRadius: '6px', fontFamily: 'monospace',
    fontSize: '13px', fontWeight: '700', color: '#9b59b6',
  },
  toggleBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '20px', marginRight: '5px', padding: '5px',
  },
  editBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px',
    cursor: 'pointer', marginRight: '5px',
  },
  deleteBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
};

export default DiscountManagement;