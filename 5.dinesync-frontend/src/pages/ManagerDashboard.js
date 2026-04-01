import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import api from '../services/api';
import { FaUtensils, FaClipboardList, FaChair, FaBoxes,
  FaSignOutAlt, FaTachometerAlt, FaChartLine, FaUsers,
  FaClock, FaCheckCircle } from 'react-icons/fa';

const ManagerDashboard = () => {
  useBlockBackNav();
  const { user, logout, setAttendanceId } = useAuth();
  const navigate = useNavigate();
  const [menuCount, setMenuCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Attendance states
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceId, setAttendanceIdLocal] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [showCheckedOutMsg, setShowCheckedOutMsg] = useState(false);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchStats();

    // Live clock
    const clockInterval = setInterval(() =>
      setClock(new Date().toLocaleTimeString()), 1000);

    // Restore check-in state if already checked in today
    const savedAttId = sessionStorage.getItem('attendanceId');
    const savedCheckIn = sessionStorage.getItem('checkInTime');
    if (savedAttId && savedCheckIn) {
      setCheckedIn(true);
      setCheckInTime(savedCheckIn);
      setAttendanceIdLocal(savedAttId);
    }

    return () => clearInterval(clockInterval);
  }, []);

  const fetchStats = async () => {
    try {
      const [menu, ordersRes, tables, inventory] = await Promise.all([
        api.get('/api/menu-items'),
        api.get('/api/orders'),
        api.get('/api/tables'),
        api.get('/api/inventory'),
      ]);
      setMenuCount(menu.data.length);
      setOrderCount(ordersRes.data.length);
      setTableCount(tables.data.length);
      setInventoryCount(inventory.data.length);
      setOrders(ordersRes.data.slice(0, 5));
    } catch (err) { console.error(err); }
  };

  // ── CHECK IN ──
  const handleCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = now.toTimeString().substring(0, 5);

      // Check if already checked in today
      const existing = await api.get(`/api/attendance/date/${today}`);
      const alreadyIn = existing.data.find(
        a => String(a.userId) === String(user?.userId)
      );

      if (alreadyIn) {
        alert(`⚠️ You already checked in today at ${alreadyIn.checkInTime}. You can only check in once per day.`);
        setCheckedIn(true);
        setCheckInTime(alreadyIn.checkInTime);
        setAttendanceIdLocal(alreadyIn.attendanceId);
        sessionStorage.setItem('attendanceId', alreadyIn.attendanceId);
        sessionStorage.setItem('checkInTime', alreadyIn.checkInTime);
        return;
      }

      const res = await api.post('/api/attendance', {
        userId: user?.userId || 6,
        fullName: user?.email?.split('@')[0] || 'Manager',
        role: 'MANAGER',
        date: today,
        checkInTime: timeStr,
        checkOutTime: null,
        status: 'PRESENT',
        leaveType: 'NONE',
        remarks: 'Checked in from Manager Dashboard',
      });

      const attId = res.data.attendanceId;
      setAttendanceIdLocal(attId);
      setAttendanceId(attId);
      sessionStorage.setItem('attendanceId', attId);
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

      // Calculate hours worked
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const hoursStr = `${hrs}h ${mins}m`;

      // Get existing record
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

  const stats = [
    { title: 'Menu Items', value: menuCount, icon: <FaUtensils />, color: '#f5a623' },
    { title: 'Total Orders', value: orderCount, icon: <FaClipboardList />, color: '#2ecc71' },
    { title: 'Tables', value: tableCount, icon: <FaChair />, color: '#3498db' },
    { title: 'Inventory Items', value: inventoryCount, icon: <FaBoxes />, color: '#e74c3c' },
  ];

  const statusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623',
    READY: '#9b59b6', DELIVERED: '#2ecc71', CANCELLED: '#e74c3c',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'menu', label: 'Menu Management', icon: <FaUtensils /> },
    { id: 'orders', label: 'Orders', icon: <FaClipboardList /> },
    { id: 'tables', label: 'Tables', icon: <FaChair /> },
    { id: 'inventory', label: 'Inventory', icon: <FaBoxes /> },
    { id: 'kitchen', label: 'Kitchen', icon: <FaChartLine /> },
    { id: 'salary', label: 'Staff Salaries', icon: <FaUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FaClock /> },
    { id: 'sales', label: 'Sales', icon: <FaChartLine /> },
    { id: 'discounts', label: 'Discounts', icon: <FaUsers /> },
  ];

  const handleNav = (id) => {
    setActiveMenu(id);
    if (id === 'menu') navigate('/menu');
    if (id === 'orders') navigate('/orders');
    if (id === 'tables') navigate('/tables');
    if (id === 'inventory') navigate('/inventory');
    if (id === 'kitchen') navigate('/kitchen');
    if (id === 'salary') navigate('/salary');
    if (id === 'attendance') navigate('/attendance');
    if (id === 'sales') navigate('/sales');
    if (id === 'discounts') navigate('/discounts');
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
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
                <span>In since {checkInTime}</span>
              </div>
              <button style={styles.checkOutBtn} onClick={handleCheckOut}>
                🚪 Check Out
              </button>
            </div>
          )}

          {showCheckedOutMsg && (
            <div style={styles.hoursMsg}>
              ✅ Done! Total: {totalHours}
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <div key={item.id}
              style={activeMenu === item.id
                ? styles.navItemActive : styles.navItem}
              onClick={() => handleNav(item.id)}>
              <span style={styles.navIcon}>{item.icon}</span>
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
          <div>
            <h1 style={styles.headerTitle}>Manager Dashboard</h1>
            <p style={styles.headerSub}>Welcome back, {user?.email}</p>
          </div>
          <div style={styles.roleBadge}>MANAGER</div>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={{...styles.statIcon, background: stat.color}}>
                {stat.icon}
              </div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statTitle}>{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>#{order.orderId}</strong>
                  </td>
                  <td style={styles.td}>
                    {order.customerName || `Customer ${order.customerId}`}
                  </td>
                  <td style={styles.td}>{order.orderType}</td>
                  <td style={styles.td}>${order.totalAmount}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: statusColors[order.orderStatus]
                    }}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{
                    ...styles.td, textAlign:'center', color:'#888'
                  }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{...styles.section, marginTop:'20px'}}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {[
              { label: 'Manage Menu', color: '#f5a623', path: '/menu' },
              { label: 'View Orders', color: '#2ecc71', path: '/orders' },
              { label: 'Manage Tables', color: '#3498db', path: '/tables' },
              { label: 'Check Inventory', color: '#e74c3c', path: '/inventory' },
              { label: 'Kitchen View', color: '#9b59b6', path: '/kitchen' },
              { label: 'Staff Salaries', color: '#1a1a2e', path: '/salary' },
              { label: 'Attendance', color: '#3498db', path: '/attendance' },
              { label: 'Sales Analytics', color: '#2ecc71', path: '/sales' },
              { label: 'Discounts', color: '#f5a623', path: '/discounts' },
            ].map((btn, i) => (
              <button key={i}
                style={{...styles.actionBtn, background: btn.color}}
                onClick={() => navigate(btn.path)}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
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
    width: '250px', background: '#1a1a2e', color: 'white',
    display: 'flex', flexDirection: 'column',
    padding: '20px 0', overflowY: 'auto',
  },
  logo: {
    display: 'flex', alignItems: 'center',
    padding: '0 20px 15px',
    borderBottom: '1px solid #2d2d44',
  },
  logoIcon: { fontSize: '28px', marginRight: '10px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },

  // ── ATTENDANCE WIDGET ──
  attendanceWidget: {
    background: 'rgba(255,255,255,0.05)',
    margin: '12px 10px', borderRadius: '12px', padding: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  clockDisplay: {
    fontSize: '18px', fontWeight: '800', color: '#f5a623',
    textAlign: 'center', marginBottom: '10px', letterSpacing: '1px',
  },
  checkInBtn: {
    width: '100%', padding: '9px', background: '#2ecc71',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '13px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
  },
  checkedInInfo: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', color: '#2ecc71', marginBottom: '8px',
    justifyContent: 'center', fontWeight: '600',
  },
  checkOutBtn: {
    width: '100%', padding: '9px', background: '#e74c3c',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '13px',
  },
  hoursMsg: {
    marginTop: '8px', padding: '6px',
    background: 'rgba(46,204,113,0.15)', borderRadius: '6px',
    fontSize: '11px', color: '#2ecc71',
    textAlign: 'center', fontWeight: '600',
  },

  nav: { flex: 1, padding: '10px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', padding: '11px 20px',
    cursor: 'pointer', color: '#aaa', fontSize: '13px', gap: '12px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', padding: '11px 20px',
    cursor: 'pointer', color: 'white',
    background: 'rgba(245,166,35,0.15)',
    borderLeft: '3px solid #f5a623', fontSize: '13px', gap: '12px',
  },
  navIcon: { fontSize: '15px' },
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
  headerTitle: {
    fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0,
  },
  headerSub: { color: '#888', margin: '4px 0 0', fontSize: '14px' },
  roleBadge: {
    background: '#3498db', color: 'white', padding: '6px 16px',
    borderRadius: '20px', fontWeight: '600', fontSize: '13px',
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
  statIcon: {
    padding: '15px', borderRadius: '10px',
    color: 'white', fontSize: '20px',
  },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e' },
  statTitle: { color: '#888', fontSize: '13px' },
  section: {
    background: 'white', borderRadius: '12px', padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '20px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa' },
  th: {
    padding: '12px 15px', textAlign: 'left',
    fontSize: '13px', fontWeight: '600', color: '#555',
  },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '12px 15px', fontSize: '14px', color: '#333' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  actionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px',
  },
  actionBtn: {
    padding: '15px', color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
};

export default ManagerDashboard;