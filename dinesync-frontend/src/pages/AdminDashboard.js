import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUtensils, FaClipboardList, FaChair, FaBoxes, FaSignOutAlt, FaTachometerAlt, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuCount, setMenuCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [menu, orders, tables, inventory] = await Promise.all([
        api.get('/api/menu-items'),
        api.get('/api/orders'),
        api.get('/api/tables'),
        api.get('/api/inventory'),
      ]);
      setMenuCount(menu.data.length);
      setOrderCount(orders.data.length);
      setTableCount(tables.data.length);
      setInventoryCount(inventory.data.length);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { title: 'Menu Items', value: menuCount, icon: <FaUtensils />, color: '#f5a623' },
    { title: 'Total Orders', value: orderCount, icon: <FaClipboardList />, color: '#2ecc71' },
    { title: 'Tables', value: tableCount, icon: <FaChair />, color: '#3498db' },
    { title: 'Inventory Items', value: inventoryCount, icon: <FaBoxes />, color: '#e74c3c' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <nav style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
            { id: 'menu', label: 'Menu Management', icon: <FaUtensils /> },
            { id: 'orders', label: 'Orders', icon: <FaClipboardList /> },
            { id: 'tables', label: 'Tables', icon: <FaChair /> },
            { id: 'inventory', label: 'Inventory', icon: <FaBoxes /> },
            { id: 'sales', label: 'Sales', icon: <FaChartLine /> },
          ].map(item => (
            <div
              key={item.id}
              style={activeMenu === item.id ? styles.navItemActive : styles.navItem}
              onClick={() => {
  setActiveMenu(item.id);
  if (item.id === 'menu') navigate('/menu');
  if (item.id === 'orders') navigate('/orders');
  if (item.id === 'tables') navigate('/tables');
  if (item.id === 'inventory') navigate('/inventory');
  if (item.id === 'kitchen') navigate('/kitchen');
  if (item.id === 'sales') navigate('/sales');
}}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt />
          <span style={{ marginLeft: '10px' }}>Logout</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSub}>Welcome back, {user?.email}</p>
          </div>
          <div style={styles.roleBadge}>{user?.role}</div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statTitle}>{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {[
              { label: 'Add Menu Item', color: '#f5a623', action: () => navigate('/menu') },
              { label: 'View Orders', color: '#2ecc71', action: () => navigate('/orders') },
              { label: 'Manage Tables', color: '#3498db', action: () => navigate('/tables') },
              { label: 'Check Inventory', color: '#e74c3c', action: () => navigate('/inventory') },
            ].map((btn, i) => (
              <button
                key={i}
                style={{ ...styles.actionBtn, background: btn.color }}
                onClick={btn.action}
              >
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
  container: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: {
    width: '250px', background: '#1a1a2e', color: 'white',
    display: 'flex', flexDirection: 'column', padding: '20px 0',
  },
  logo: { display: 'flex', alignItems: 'center', padding: '0 20px 30px', borderBottom: '1px solid #2d2d44' },
  logoIcon: { fontSize: '28px', marginRight: '10px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },
  nav: { flex: 1, padding: '20px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: '#aaa', transition: 'all 0.2s',
    fontSize: '14px', gap: '12px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: 'white', background: 'rgba(245,166,35,0.15)',
    borderLeft: '3px solid #f5a623', fontSize: '14px', gap: '12px',
  },
  navIcon: { fontSize: '16px' },
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
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  headerSub: { color: '#888', margin: '4px 0 0', fontSize: '14px' },
  roleBadge: {
    background: '#f5a623', color: 'white', padding: '6px 16px',
    borderRadius: '20px', fontWeight: '600', fontSize: '13px',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' },
  statCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statIcon: { padding: '15px', borderRadius: '10px', color: 'white', fontSize: '20px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e' },
  statTitle: { color: '#888', fontSize: '13px' },
  section: {
    background: 'white', borderRadius: '12px', padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
  actionBtn: {
    padding: '15px', color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
};

export default AdminDashboard;