import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import api from '../services/api';
import {
  FaUtensils, FaClipboardList, FaChair, FaBoxes,
  FaSignOutAlt, FaTachometerAlt, FaChartLine,
  FaUsers, FaTag, FaMoneyBill, FaBell, FaCalendarAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  useBlockBackNav(); 
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
  

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'menu', label: 'Menu Management', icon: <FaUtensils /> },
    { id: 'orders', label: 'Orders', icon: <FaClipboardList /> },
    { id: 'tables', label: 'Tables', icon: <FaChair /> },
    { id: 'inventory', label: 'Inventory', icon: <FaBoxes /> },
    { id: 'sales', label: 'Sales', icon: <FaChartLine /> },
    { id: 'kitchen', label: 'Kitchen', icon: <FaUtensils /> },
    { id: 'salary', label: 'Staff Salaries', icon: <FaUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FaCalendarAlt /> },
    { id: 'discounts', label: 'Discounts & Coupons', icon: <FaTag /> },
    { id: 'payments', label: 'Payments', icon: <FaMoneyBill /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  const handleNav = (id) => {
    setActiveMenu(id);
    if (id === 'menu') navigate('/menu');
    if (id === 'orders') navigate('/orders');
    if (id === 'tables') navigate('/tables');
    if (id === 'inventory') navigate('/inventory');
    if (id === 'sales') navigate('/sales');
    if (id === 'kitchen') navigate('/kitchen');
    if (id === 'salary') navigate('/salary');
    if (id === 'attendance') navigate('/attendance');
    if (id === 'discounts') navigate('/discounts');
    if (id === 'payments') navigate('/payments');
    if (id === 'notifications') navigate('/notifications');
  };

  const stats = [
    { title: 'Menu Items', value: menuCount, icon: <FaUtensils />, color: '#f5a623' },
    { title: 'Total Orders', value: orderCount, icon: <FaClipboardList />, color: '#2ecc71' },
    { title: 'Tables', value: tableCount, icon: <FaChair />, color: '#3498db' },
    { title: 'Inventory Items', value: inventoryCount, icon: <FaBoxes />, color: '#e74c3c' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
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
          onClick={() => { logout(); navigate('/login'); }}>
          <FaSignOutAlt />
          <span style={{marginLeft: '10px'}}>Logout</span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSub}>Welcome back, {user?.email}</p>
          </div>
          <div style={styles.roleBadge}>{user?.role}</div>
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
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {[
              { label: 'Add Menu Item', color: '#f5a623', path: '/menu' },
              { label: 'View Orders', color: '#2ecc71', path: '/orders' },
              { label: 'Manage Tables', color: '#3498db', path: '/tables' },
              { label: 'Check Inventory', color: '#e74c3c', path: '/inventory' },
              { label: 'Sales Report', color: '#9b59b6', path: '/sales' },
              { label: 'Kitchen View', color: '#1abc9c', path: '/kitchen' },
              { label: 'Staff Salaries', color: '#e67e22', path: '/salary' },
              { label: 'Attendance', color: '#27ae60', path: '/attendance' },
              { label: 'Discounts', color: '#e91e63', path: '/discounts' },
              { label: 'Payments', color: '#2980b9', path: '/payments' },
              { label: 'Notifications', color: '#8e44ad', path: '/notifications' },
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
    padding: '0 20px 30px',
    borderBottom: '1px solid #2d2d44',
  },
  logoIcon: { fontSize: '28px', marginRight: '10px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#f5a623' },
  nav: { flex: 1, padding: '20px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: '#aaa', fontSize: '14px', gap: '12px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: 'white',
    background: 'rgba(245,166,35,0.15)',
    borderLeft: '3px solid #f5a623',
    fontSize: '14px', gap: '12px',
  },
  navIcon: { fontSize: '16px' },
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
    background: '#f5a623', color: 'white', padding: '6px 16px',
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
  actionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px',
  },
  actionBtn: {
    padding: '15px', color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
  },
};

export default AdminDashboard;