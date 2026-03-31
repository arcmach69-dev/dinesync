import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import api from '../services/api';
import {
  FaPlus, FaSignOutAlt, FaChair, FaClipboardList,
  FaUtensils, FaEdit, FaClock, FaCheckCircle
} from 'react-icons/fa';

const WaiterDashboard = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('tables');

  // Attendance states
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceId, setAttendanceIdLocal] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [showCheckedOutMsg, setShowCheckedOutMsg] = useState(false);

  const { user, logout, setAttendanceId } = useAuth();
  const navigate = useNavigate();
  useBlockBackNav();

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);

    // Restore check-in state if already checked in today
    const savedAttId = sessionStorage.getItem('attendanceId');
    const savedCheckIn = sessionStorage.getItem('checkInTime');
    if (savedAttId && savedCheckIn) {
      setCheckedIn(true);
      setCheckInTime(savedCheckIn);
      setAttendanceIdLocal(savedAttId);
    }

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

  // ── CHECK IN ──
  const handleCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = now.toTimeString().substring(0, 5);

      const res = await api.post('/api/attendance', {
        userId: user?.userId || 7,
        fullName: user?.email?.split('@')[0] || 'Waiter',
        role: 'WAITER',
        date: today,
        checkInTime: timeStr,
        checkOutTime: null,
        status: 'PRESENT',
        leaveType: 'NONE',
        remarks: 'Checked in from Waiter Dashboard',
      });

      const attId = res.data.attendanceId;
      setAttendanceIdLocal(attId);
      setAttendanceId(attId);
      sessionStorage.setItem('checkInTime', timeStr);
      setCheckInTime(timeStr);
      setCheckedIn(true);
      alert(`✅ Checked in at ${timeStr}. Have a great shift!`);
    } catch (err) {
      console.error(err);
      alert('Check-in failed. Try again.');
    }
  };

  // ── CHECK OUT ──
  const handleCheckOut = async () => {
    if (!attendanceId) {
      alert('No check-in record found. Please check in first.');
      return;
    }
    try {
      const now = new Date();
      const checkOutTime = now.toTimeString().substring(0, 5);

      // Calculate hours
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const hoursStr = `${hrs}h ${mins}m`;

      // Get existing record and update
      const existing = await api.get(`/api/attendance/${attendanceId}`);
      await api.put(`/api/attendance/${attendanceId}`, {
        ...existing.data,
        checkOutTime,
        remarks: `Shift: ${checkInTime} - ${checkOutTime}. Total: ${hoursStr}`,
      });

      setTotalHours(hoursStr);
      setCheckedIn(false);
      setShowCheckedOutMsg(true);
      sessionStorage.removeItem('checkInTime');
      sessionStorage.removeItem('attendanceId');

      setTimeout(() => setShowCheckedOutMsg(false), 5000);
    } catch (err) {
      console.error(err);
      alert('Check-out failed. Try again.');
    }
  };

  // ── NOTIFY CUSTOMER WHEN ORDER READY ──
  const notifyCustomerOrderReady = async (order) => {
    try {
      // Send email if phone/email available
      if (order.customerName) {
        // Send SMS if phone available
        if (order.customerPhone) {
          await api.post('/api/sms/order-ready', {
            to: order.customerPhone,
            orderId: order.orderId,
            customerName: order.customerName,
          }).catch(() => {}); // Don't block if SMS fails
        }

        // Send email notification
        await api.post('/api/email/order-ready', {
          to: user?.email, // Send to restaurant email as backup
          orderId: order.orderId,
          customerName: order.customerName,
          orderType: order.orderType,
          amount: order.totalAmount,
        }).catch(() => {}); // Don't block if email fails
      }
    } catch (err) {
      console.error('Notification failed:', err);
    }
  };

  const handleDispatch = async (order) => {
    try {
      await api.put(`/api/orders/${order.orderId}`, {
        ...order, orderStatus: 'DELIVERED'
      });
      if (order.tableId) {
        const table = tables.find(t => t.tableId === order.tableId);
        if (table) {
          await api.put(`/api/tables/${table.tableId}`, {
            ...table, status: 'AVAILABLE', currentOrderId: null,
          });
        }
      }
      fetchAll();
      alert(`Order #${order.orderId} marked as DELIVERED!`);
    } catch (err) { console.error(err); }
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }
    if (customerPhone) {
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(customerPhone)) {
        alert('Please enter a valid US phone number: (555) 123-4567');
        return;
      }
    }
    try {
      const totalAmount = selectedItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
      );
      const orderRes = await api.post('/api/orders', {
        customerId: 1,
        tableId: selectedTable?.tableId || null,
        waiterId: user?.userId || 1,
        orderType,
        orderStatus: 'RECEIVED',
        totalAmount: totalAmount.toFixed(2),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null,
      });

      // Send order confirmation SMS/email to customer
      if (customerPhone) {
        await api.post('/api/sms/order-confirmation', {
          to: customerPhone,
          orderId: orderRes.data.orderId,
          orderType,
          amount: totalAmount.toFixed(2),
        }).catch(() => {});
      }

      if (selectedTable) {
        await api.put(`/api/tables/${selectedTable.tableId}`, {
          ...selectedTable, status: 'OCCUPIED',
          currentOrderId: orderRes.data.orderId,
        });
      }
      setShowOrderForm(false);
      setSelectedTable(null);
      setSelectedItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      fetchAll();
      alert(`✅ Order #${orderRes.data.orderId} placed! SMS sent to customer.`);
    } catch (err) { console.error(err); }
  };

  const handleEditOrder = async () => {
    try {
      await api.put(`/api/orders/${editOrder.orderId}`, {
        ...editOrder,
      });
      setShowEditForm(false);
      setEditOrder(null);
      fetchAll();
      alert('Order updated!');
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
    READY: '#2ecc71', DELIVERED: '#9b59b6', CANCELLED: '#e74c3c',
  };
  const activeOrders = orders.filter(o => o.orderStatus !== 'CANCELLED');

  const formatPhone = (value) => {
    const input = value.replace(/\D/g, '');
    if (!input) return '';
    if (input.length <= 3) return `(${input}`;
    if (input.length <= 6) return `(${input.slice(0,3)}) ${input.slice(3)}`;
    return `(${input.slice(0,3)}) ${input.slice(3,6)}-${input.slice(6,10)}`;
  };

  // Live clock
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const t = setInterval(() =>
      setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>

        {/* User info */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>👤</div>
          <div>
            <div style={styles.userName}>
              {user?.email?.split('@')[0]}
            </div>
            <div style={styles.userRole}>WAITER</div>
          </div>
        </div>

        {/* ── ATTENDANCE CHECK IN/OUT WIDGET ── */}
        <div style={styles.attendanceWidget}>
          <div style={styles.clockDisplay}>{clock}</div>

          {!checkedIn ? (
            <button style={styles.checkInBtn} onClick={handleCheckIn}>
              <FaClock /> Check In
            </button>
          ) : (
            <div>
              <div style={styles.checkedInInfo}>
                <FaCheckCircle style={{color:'#2ecc71'}} />
                <span>Checked in at {checkInTime}</span>
              </div>
              <button style={styles.checkOutBtn} onClick={handleCheckOut}>
                🚪 Check Out
              </button>
            </div>
          )}

          {showCheckedOutMsg && (
            <div style={styles.hoursMsg}>
              ✅ Checked out! Total: {totalHours}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {[
            { id: 'tables', label: 'Tables', icon: <FaChair /> },
            { id: 'orders', label: 'My Orders', icon: <FaClipboardList /> },
            { id: 'menu', label: 'Menu', icon: <FaUtensils /> },
          ].map(item => (
            <div key={item.id}
              style={activeTab === item.id
                ? styles.navItemActive : styles.navItem}
              onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          <FaSignOutAlt />
          <span style={{marginLeft:'10px'}}>Logout</span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {activeTab === 'tables' && '🪑 Tables Overview'}
            {activeTab === 'orders' && '📋 My Orders'}
            {activeTab === 'menu' && '🍽️ Menu Items'}
          </h1>
          <div style={styles.stats}>
            <span style={styles.statBadge}>
              {tables.filter(t => t.status === 'AVAILABLE').length} Available
            </span>
            <span style={{...styles.statBadge, background:'#e74c3c'}}>
              {tables.filter(t => t.status === 'OCCUPIED').length} Occupied
            </span>
            <span style={{...styles.statBadge, background:'#3498db'}}>
              {activeOrders.filter(o =>
                o.orderStatus !== 'DELIVERED').length} Active
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
                  <div style={styles.tableInfo}>
                    👥 {table.capacity} seats
                  </div>
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
            </div>
            <button style={styles.newOrderBtn}
              onClick={() => {
                setSelectedTable(null);
                setShowOrderForm(true);
              }}>
              <FaPlus /> New Takeaway / Online Order
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
                  <span style={styles.orderId}>
                    Order #{order.orderId}
                  </span>
                  <span style={{
                    ...styles.orderStatus,
                    background: orderStatusColors[order.orderStatus]
                  }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div style={styles.orderInfo}>
                  🛒 {order.orderType} • 💰 ${order.totalAmount}
                </div>
                {order.customerName && (
                  <div style={styles.customerInfo}>
                    👤 {order.customerName}
                    {order.customerPhone &&
                      ` • 📞 ${order.customerPhone}`}
                  </div>
                )}
                {order.notes && (
                  <div style={styles.notesInfo}>
                    📝 {order.notes}
                  </div>
                )}

                {/* Edit — only RECEIVED */}
                {order.orderStatus === 'RECEIVED' && (
                  <button style={styles.editBtn}
                    onClick={() => {
                      setEditOrder({...order});
                      setShowEditForm(true);
                    }}>
                    <FaEdit /> Edit Order
                  </button>
                )}

                {/* READY — notify + dispatch */}
                {order.orderStatus === 'READY' && (
                  <div>
                    <div style={styles.readyAlert}>
                      ✅ Ready to serve!
                    </div>
                    
                    <button style={styles.dispatchBtn}
                      onClick={() => handleDispatch(order)}>
                      🚀 Dispatch / Mark Delivered
                    </button>
                  </div>
                )}

                {/* Bill */}
                {order.orderStatus === 'DELIVERED' && (
                  <button style={styles.billBtn}
                    onClick={() =>
                      navigate(`/invoice/${order.orderId}`)}>
                    🧾 Generate Bill
                  </button>
                )}
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div style={styles.empty}>No orders yet.</div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div style={styles.menuGrid}>
            {menuItems.map(item => (
              <div key={item.itemId} style={styles.menuCard}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.dishName}
                    style={styles.menuImg}
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
                <div style={styles.menuName}>{item.dishName}</div>
                <div style={styles.menuCategory}>{item.category}</div>
                <div style={styles.menuPrice}>${item.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* PLACE ORDER MODAL */}
        {showOrderForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {selectedTable
                  ? `Place Order — Table ${selectedTable.tableNumber}`
                  : 'New Order'}
              </h2>
              <div style={styles.formRow}>
                <label style={styles.label}>Order Type:</label>
                <select style={styles.select} value={orderType}
                  onChange={e => setOrderType(e.target.value)}>
                  {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                    <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Customer Name:</label>
                <input style={styles.select} placeholder="Optional"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Phone Number:</label>
                <input style={styles.select}
                  placeholder="(555) 123-4567"
                  value={customerPhone} maxLength={14}
                  onChange={e =>
                    setCustomerPhone(formatPhone(e.target.value))} />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Special Notes:</label>
                <input style={styles.select}
                  placeholder="No onions, extra spicy, allergy..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </div>

              <h3 style={styles.sectionLabel}>Select Items:</h3>
              <div style={styles.menuSelectGrid}>
                {menuItems.map(item => (
                  <div key={item.itemId} style={styles.menuSelectItem}
                    onClick={() => addItem(item)}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.dishName}
                        style={styles.menuSelectImg}
                        onError={e => { e.target.style.display='none'; }} />
                    )}
                    <div style={styles.menuSelectName}>
                      {item.dishName}
                    </div>
                    <div style={styles.menuSelectPrice}>
                      ${item.price}
                    </div>
                    <div style={styles.addItemBtn}>+ Add</div>
                  </div>
                ))}
              </div>

              {selectedItems.length > 0 && (
                <div style={styles.selectedItems}>
                  <h3 style={styles.sectionLabel}>Selected:</h3>
                  {selectedItems.map(item => (
                    <div key={item.itemId} style={styles.selectedItem}>
                      <span>{item.dishName} x{item.qty}</span>
                      <span>
                        ${(parseFloat(item.price)*item.qty).toFixed(2)}
                      </span>
                      <button style={styles.removeBtn}
                        onClick={() => removeItem(item.itemId)}>✕
                      </button>
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
                    setCustomerName('');
                    setCustomerPhone('');
                    setNotes('');
                  }}>Cancel</button>
                <button style={styles.saveBtn}
                  onClick={handlePlaceOrder}>
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT ORDER MODAL */}
        {showEditForm && editOrder && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                Edit Order #{editOrder.orderId}
              </h2>
              <div style={styles.formRow}>
                <label style={styles.label}>Order Type:</label>
                <select style={styles.select}
                  value={editOrder.orderType}
                  onChange={e => setEditOrder({
                    ...editOrder, orderType: e.target.value
                  })}>
                  {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                    <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Customer Name:</label>
                <input style={styles.select}
                  value={editOrder.customerName || ''}
                  onChange={e => setEditOrder({
                    ...editOrder, customerName: e.target.value
                  })} />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Phone Number:</label>
                <input style={styles.select}
                  value={editOrder.customerPhone || ''}
                  maxLength={14}
                  onChange={e => setEditOrder({
                    ...editOrder,
                    customerPhone: formatPhone(e.target.value)
                  })} />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Notes:</label>
                <input style={styles.select}
                  value={editOrder.notes || ''}
                  onChange={e => setEditOrder({
                    ...editOrder, notes: e.target.value
                  })} />
              </div>
              <div style={styles.modalBtns}>
                <button style={styles.cancelBtn}
                  onClick={() => {
                    setShowEditForm(false);
                    setEditOrder(null);
                  }}>Cancel</button>
                <button style={styles.saveBtn}
                  onClick={handleEditOrder}>
                  Save Changes
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
  container: {
    display: 'flex', height: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  sidebar: {
    width: '260px', background: '#1a1a2e', color: 'white',
    display: 'flex', flexDirection: 'column', padding: '20px 0',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex', alignItems: 'center',
    padding: '0 20px 15px', gap: '10px',
  },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 20px', background: 'rgba(255,255,255,0.05)',
    margin: '0 10px 15px', borderRadius: '10px',
  },
  userAvatar: { fontSize: '24px' },
  userName: { fontSize: '13px', color: 'white', fontWeight: '600' },
  userRole: { fontSize: '11px', color: '#f5a623', fontWeight: '600' },

  // ── ATTENDANCE WIDGET ──
  attendanceWidget: {
    background: 'rgba(255,255,255,0.05)',
    margin: '0 10px 15px', borderRadius: '12px', padding: '15px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  clockDisplay: {
    fontSize: '20px', fontWeight: '800', color: '#f5a623',
    textAlign: 'center', marginBottom: '12px', letterSpacing: '1px',
  },
  checkInBtn: {
    width: '100%', padding: '10px', background: '#2ecc71',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '14px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
  },
  checkedInInfo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '12px', color: '#2ecc71', marginBottom: '10px',
    justifyContent: 'center', fontWeight: '600',
  },
  checkOutBtn: {
    width: '100%', padding: '10px', background: '#e74c3c',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '14px',
  },
  hoursMsg: {
    marginTop: '8px', padding: '8px', background: 'rgba(46,204,113,0.15)',
    borderRadius: '6px', fontSize: '12px', color: '#2ecc71',
    textAlign: 'center', fontWeight: '600',
  },

  nav: { flex: 1, padding: '5px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', cursor: 'pointer', color: '#aaa', fontSize: '14px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', cursor: 'pointer', color: 'white',
    background: 'rgba(245,166,35,0.15)',
    borderLeft: '3px solid #f5a623', fontSize: '14px',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', padding: '15px 20px',
    cursor: 'pointer', color: '#e74c3c',
    borderTop: '1px solid #2d2d44', fontSize: '14px',
  },
  main: {
    flex: 1, background: '#f0f2f5',
    overflow: 'auto', padding: '30px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'white', padding: '20px 30px', borderRadius: '12px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: 0,
  },
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
  tableNumber: {
    fontSize: '20px', fontWeight: '800',
    color: '#1a1a2e', marginBottom: '8px',
  },
  tableInfo: { fontSize: '13px', color: '#888', marginBottom: '4px' },
  statusBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600', margin: '10px 0',
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
  orderInfo: { fontSize: '14px', color: '#555', marginBottom: '5px' },
  customerInfo: {
    fontSize: '13px', color: '#3498db',
    fontWeight: '600', marginBottom: '5px',
  },
  notesInfo: {
    fontSize: '12px', color: '#888', fontStyle: 'italic',
    marginBottom: '8px', padding: '5px 8px',
    background: '#f8f9fa', borderRadius: '6px',
  },
  editBtn: {
    width: '100%', padding: '8px', background: '#f5a623',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', fontSize: '13px',
    marginBottom: '5px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '5px',
  },
  readyAlert: {
    marginTop: '10px', padding: '8px',
    background: '#e8f8f0', color: '#2ecc71',
    borderRadius: '6px', fontSize: '13px',
    fontWeight: '600', textAlign: 'center',
  },
  notifyBtn: {
    width: '100%', padding: '8px', background: '#3498db',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600',
    fontSize: '13px', marginTop: '6px',
  },
  dispatchBtn: {
    width: '100%', padding: '10px', background: '#2ecc71',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600',
    fontSize: '13px', marginTop: '6px',
  },
  billBtn: {
    width: '100%', padding: '10px', background: '#3498db',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600',
    fontSize: '13px', marginTop: '8px',
  },
  menuGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
  },
  menuCard: {
    background: 'white', borderRadius: '12px',
    padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    textAlign: 'center', overflow: 'hidden',
  },
  menuImg: {
    width: '100%', height: '120px', objectFit: 'cover',
    borderRadius: '8px', marginBottom: '10px',
  },
  menuName: {
    fontSize: '14px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '4px',
  },
  menuCategory: {
    fontSize: '11px', color: '#f5a623', marginBottom: '4px',
  },
  menuPrice: {
    fontSize: '16px', fontWeight: '800', color: '#2ecc71',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '650px', maxHeight: '85vh', overflow: 'auto',
  },
  modalTitle: {
    fontSize: '20px', fontWeight: '700',
    marginBottom: '20px', color: '#1a1a2e',
  },
  formRow: {
    display: 'flex', alignItems: 'center',
    gap: '15px', marginBottom: '15px',
  },
  label: {
    fontSize: '14px', fontWeight: '600',
    color: '#333', minWidth: '130px',
  },
  select: {
    flex: 1, padding: '8px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  sectionLabel: {
    fontSize: '16px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '12px',
  },
  menuSelectGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px', marginBottom: '20px',
  },
  menuSelectItem: {
    border: '2px solid #e0e0e0', borderRadius: '10px',
    padding: '10px', cursor: 'pointer', textAlign: 'center',
    overflow: 'hidden',
  },
  menuSelectImg: {
    width: '100%', height: '70px', objectFit: 'cover',
    borderRadius: '6px', marginBottom: '6px',
  },
  menuSelectName: {
    fontSize: '12px', fontWeight: '600',
    color: '#1a1a2e', marginBottom: '4px',
  },
  menuSelectPrice: {
    fontSize: '13px', color: '#2ecc71',
    fontWeight: '700', marginBottom: '6px',
  },
  addItemBtn: {
    background: '#f5a623', color: 'white',
    padding: '4px 10px', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600',
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
  modalBtns: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 20px', background: '#f5a623', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  empty: {
    color: '#888', padding: '40px',
    textAlign: 'center', gridColumn: '1/-1',
  },
};

export default WaiterDashboard;