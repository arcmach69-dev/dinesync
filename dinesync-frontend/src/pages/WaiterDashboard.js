import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaPlus, FaSignOutAlt, FaChair, FaClipboardList, FaUtensils } from 'react-icons/fa';

const WaiterDashboard = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [activeTab, setActiveTab] = useState('tables');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [t, o, m] = await Promise.all([
        api.get('/api/tables'),
        api.get('/api/orders'),
        api.get('/api/menu-items'),
      ]);
      setTables(t.data);
      setOrders(o.data);
      setMenuItems(m.data.filter(i => i.availability === 'AVAILABLE'));
    } catch (err) { console.error(err); }
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }
    try {
      const totalAmount = selectedItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
      );
      const orderRes = await api.post('/api/orders', {
        customerId: 1,
        tableId: selectedTable?.tableId || null,
        waiterId: 1,
        orderType,
        orderStatus: 'RECEIVED',
        totalAmount: totalAmount.toFixed(2),
      });
      // Update table status to OCCUPIED
      if (selectedTable) {
        await api.put(`/api/tables/${selectedTable.tableId}`, {
          ...selectedTable, status: 'OCCUPIED',
          currentOrderId: orderRes.data.orderId,
        });
      }
      setShowOrderForm(false);
      setSelectedTable(null);
      setSelectedItems([]);
      fetchAll();
      alert(`Order #${orderRes.data.orderId} placed successfully!`);
    } catch (err) { console.error(err); }
  };

  const addItem = (item) => {
    const existing = selectedItems.find(i => i.itemId === item.itemId);
    if (existing) {
      setSelectedItems(selectedItems.map(i =>
        i.itemId === item.itemId ? {...i, qty: i.qty + 1} : i
      ));
    } else {
      setSelectedItems([...selectedItems, {...item, qty: 1}]);
    }
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.itemId !== itemId));
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
  );

  const statusColors = {
    AVAILABLE: '#2ecc71', OCCUPIED: '#e74c3c', RESERVED: '#f5a623',
  };

  const orderStatusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623',
    READY: '#9b59b6', DELIVERED: '#2ecc71', CANCELLED: '#e74c3c',
  };

  const activeOrders = orders.filter(o =>
    o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>👤</div>
          <div>
            <div style={styles.userName}>{user?.email}</div>
            <div style={styles.userRole}>WAITER</div>
          </div>
        </div>
        <nav style={styles.nav}>
          {[
            { id: 'tables', label: 'Tables', icon: <FaChair /> },
            { id: 'orders', label: 'Active Orders', icon: <FaClipboardList /> },
            { id: 'menu', label: 'Menu', icon: <FaUtensils /> },
          ].map(item => (
            <div key={item.id}
              style={activeTab === item.id ? styles.navItemActive : styles.navItem}
              onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login'); }}>
          <FaSignOutAlt />
          <span style={{marginLeft:'10px'}}>Logout</span>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {activeTab === 'tables' && '🪑 Tables Overview'}
            {activeTab === 'orders' && '📋 Active Orders'}
            {activeTab === 'menu' && '🍽️ Menu Items'}
          </h1>
          <div style={styles.stats}>
            <span style={styles.statBadge}>
              {tables.filter(t => t.status === 'AVAILABLE').length} Available
            </span>
            <span style={{...styles.statBadge, background: '#e74c3c'}}>
              {tables.filter(t => t.status === 'OCCUPIED').length} Occupied
            </span>
            <span style={{...styles.statBadge, background: '#3498db'}}>
              {activeOrders.length} Active Orders
            </span>
          </div>
        </div>

        {/* TABLES TAB */}
        {activeTab === 'tables' && (
          <div>
            <div style={styles.tablesGrid}>
              {tables.map(table => (
                <div key={table.tableId} style={{
                  ...styles.tableCard,
                  borderTop: `5px solid ${statusColors[table.status]}`,
                  cursor: table.status === 'AVAILABLE' ? 'pointer' : 'default',
                  opacity: table.status === 'AVAILABLE' ? 1 : 0.8,
                }}
                  onClick={() => {
                    if (table.status === 'AVAILABLE') {
                      setSelectedTable(table);
                      setShowOrderForm(true);
                    }
                  }}>
                  <div style={styles.tableNumber}>
                    Table {table.tableNumber}
                  </div>
                  <div style={styles.tableInfo}>Row {table.rowName}</div>
                  <div style={styles.tableInfo}>👥 {table.capacity} seats</div>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusColors[table.status]
                  }}>
                    {table.status}
                  </span>
                  {table.status === 'AVAILABLE' && (
                    <div style={styles.clickHint}>
                      Click to place order
                    </div>
                  )}
                </div>
              ))}
              {tables.length === 0 && (
                <div style={styles.empty}>No tables available.</div>
              )}
            </div>
            <button style={styles.newOrderBtn}
              onClick={() => { setSelectedTable(null); setShowOrderForm(true); }}>
              <FaPlus /> New Takeaway/Online Order
            </button>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div style={styles.ordersGrid}>
            {activeOrders.map(order => (
              <div key={order.orderId} style={{
                ...styles.orderCard,
                borderLeft: `5px solid ${orderStatusColors[order.orderStatus]}`
              }}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>Order #{order.orderId}</span>
                  <span style={{
                    ...styles.orderStatus,
                    background: orderStatusColors[order.orderStatus]
                  }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div style={styles.orderInfo}>
                  🪑 {order.orderType} • 💰 ${order.totalAmount}
                </div>
                {order.orderStatus === 'READY' && (
                  <div style={styles.readyAlert}>
                    ✅ Ready to serve!
                  </div>
                )}
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div style={styles.empty}>No active orders.</div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div style={styles.menuGrid}>
            {menuItems.map(item => (
              <div key={item.itemId} style={styles.menuCard}>
                <div style={styles.menuName}>{item.dishName}</div>
                <div style={styles.menuCategory}>{item.category}</div>
                <div style={styles.menuPrice}>${item.price}</div>
                <div style={styles.menuSpice}>🌶️ {item.spiceLevel}</div>
              </div>
            ))}
          </div>
        )}

        {/* ORDER FORM MODAL */}
        {showOrderForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {selectedTable
                  ? `Place Order — Table ${selectedTable.tableNumber}`
                  : 'Place New Order'}
              </h2>
              <div style={styles.orderTypeRow}>
                <label style={styles.label}>Order Type:</label>
                <select style={styles.select} value={orderType}
                  onChange={e => setOrderType(e.target.value)}>
                  {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                    <option key={t}>{t}</option>)}
                </select>
              </div>
              <h3 style={styles.menuTitle}>Select Items:</h3>
              <div style={styles.menuSelectGrid}>
                {menuItems.map(item => (
                  <div key={item.itemId} style={styles.menuSelectItem}
                    onClick={() => addItem(item)}>
                    <div style={styles.menuSelectName}>{item.dishName}</div>
                    <div style={styles.menuSelectPrice}>${item.price}</div>
                    <div style={styles.addItemBtn}>+ Add</div>
                  </div>
                ))}
              </div>
              {selectedItems.length > 0 && (
                <div style={styles.selectedItems}>
                  <h3 style={styles.menuTitle}>Selected Items:</h3>
                  {selectedItems.map(item => (
                    <div key={item.itemId} style={styles.selectedItem}>
                      <span>{item.dishName} x{item.qty}</span>
                      <span>${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                      <button style={styles.removeBtn}
                        onClick={() => removeItem(item.itemId)}>✕</button>
                    </div>
                  ))}
                  <div style={styles.totalRow}>
                    <strong>Total: ${totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              )}
              <div style={styles.modalBtns}>
                <button style={styles.cancelBtn}
                  onClick={() => {
                    setShowOrderForm(false);
                    setSelectedItems([]);
                    setSelectedTable(null);
                  }}>Cancel</button>
                <button style={styles.saveBtn} onClick={handlePlaceOrder}>
                  Place Order
                </button>
              </div>
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
  logo: { display: 'flex', alignItems: 'center', padding: '0 20px 20px', gap: '10px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '15px 20px', background: 'rgba(255,255,255,0.05)',
    margin: '0 10px 20px', borderRadius: '10px',
  },
  userAvatar: { fontSize: '24px' },
  userName: { fontSize: '13px', color: 'white', fontWeight: '600' },
  userRole: { fontSize: '11px', color: '#f5a623', fontWeight: '600' },
  nav: { flex: 1, padding: '10px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', cursor: 'pointer', color: '#aaa', fontSize: '14px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', cursor: 'pointer', color: 'white',
    background: 'rgba(245,166,35,0.15)', borderLeft: '3px solid #f5a623',
    fontSize: '14px',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', padding: '15px 20px',
    cursor: 'pointer', color: '#e74c3c', borderTop: '1px solid #2d2d44',
    fontSize: '14px',
  },
  main: { flex: 1, background: '#f0f2f5', overflow: 'auto', padding: '30px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'white', padding: '20px 30px', borderRadius: '12px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  stats: { display: 'flex', gap: '10px' },
  statBadge: {
    padding: '6px 14px', background: '#2ecc71', color: 'white',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  tablesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '20px',
  },
  tableCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  tableNumber: { fontSize: '20px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' },
  tableInfo: { fontSize: '13px', color: '#888', marginBottom: '4px' },
  statusBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
    margin: '10px 0',
  },
  clickHint: { fontSize: '12px', color: '#f5a623', marginTop: '5px' },
  newOrderBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', border: 'none',
    padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', marginTop: '10px',
  },
  ordersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
  },
  orderCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px',
  },
  orderId: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  orderStatus: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  orderInfo: { fontSize: '14px', color: '#555' },
  readyAlert: {
    marginTop: '10px', padding: '8px', background: '#e8f8f0',
    color: '#2ecc71', borderRadius: '6px', fontSize: '13px',
    fontWeight: '600', textAlign: 'center',
  },
  menuGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
  },
  menuCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  menuName: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  menuCategory: { fontSize: '12px', color: '#f5a623', marginBottom: '6px' },
  menuPrice: { fontSize: '18px', fontWeight: '800', color: '#2ecc71', marginBottom: '4px' },
  menuSpice: { fontSize: '12px', color: '#888' },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '650px', maxHeight: '85vh', overflow: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  orderTypeRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  select: {
    padding: '8px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  menuTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' },
  menuSelectGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px', marginBottom: '20px',
  },
  menuSelectItem: {
    border: '2px solid #e0e0e0', borderRadius: '10px', padding: '12px',
    cursor: 'pointer', textAlign: 'center',
    transition: 'border 0.2s',
  },
  menuSelectName: { fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' },
  menuSelectPrice: { fontSize: '14px', color: '#2ecc71', fontWeight: '700', marginBottom: '6px' },
  addItemBtn: {
    background: '#f5a623', color: 'white', padding: '4px 10px',
    borderRadius: '6px', fontSize: '12px', fontWeight: '600',
  },
  selectedItems: {
    background: '#f8f9fa', borderRadius: '10px',
    padding: '15px', marginBottom: '20px',
  },
  selectedItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #e0e0e0', fontSize: '14px',
  },
  removeBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    borderRadius: '4px', padding: '2px 8px', cursor: 'pointer',
  },
  totalRow: {
    display: 'flex', justifyContent: 'flex-end',
    paddingTop: '10px', fontSize: '16px', color: '#1a1a2e',
  },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 20px', background: '#f5a623', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  empty: { color: '#888', padding: '40px', textAlign: 'center', gridColumn: '1/-1' },
};

export default WaiterDashboard;