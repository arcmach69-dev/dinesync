import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      // Show only active orders
      const active = res.data.filter(o =>
        o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
      );
      setOrders(active);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (order, newStatus) => {
    try {
      await api.put(`/api/orders/${order.orderId}`, {
        ...order, orderStatus: newStatus
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const statusColors = {
    RECEIVED: '#3498db',
    PREPARING: '#f5a623',
    READY: '#2ecc71',
  };

  const nextStatus = {
    RECEIVED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'DELIVERED',
  };

  const nextStatusLabel = {
    RECEIVED: '🔥 Start Preparing',
    PREPARING: '✅ Mark Ready',
    READY: '🚀 Mark Delivered',
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.menuItem}>
          👨‍🍳 Kitchen Dashboard
        </div>
        <div style={styles.refreshBtn} onClick={fetchOrders}>
          🔄 Refresh Orders
        </div>
        <div style={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login'); }}>
          🚪 Logout
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👨‍🍳 Kitchen Dashboard</h1>
            <p style={styles.subtitle}>
              {orders.length} active orders • Auto-refreshes every 30s
            </p>
          </div>
          <div style={styles.roleBadge}>KITCHEN</div>
        </div>

        {/* Status Summary */}
        <div style={styles.summaryGrid}>
          {['RECEIVED', 'PREPARING', 'READY'].map(status => (
            <div key={status} style={{...styles.summaryCard,
              borderTop: `4px solid ${statusColors[status]}`}}>
              <div style={{...styles.summaryCount,
                color: statusColors[status]}}>
                {orders.filter(o => o.orderStatus === status).length}
              </div>
              <div style={styles.summaryLabel}>{status}</div>
            </div>
          ))}
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✅</div>
            <h2>All caught up!</h2>
            <p>No active orders at the moment.</p>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map(order => (
              <div key={order.orderId} style={{
                ...styles.orderCard,
                borderTop: `5px solid ${statusColors[order.orderStatus] || '#888'}`
              }}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>Order #{order.orderId}</span>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusColors[order.orderStatus] || '#888'
                  }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div style={styles.orderDetails}>
                  <div style={styles.orderDetail}>
                    👤 Customer {order.customerId}
                  </div>
                  <div style={styles.orderDetail}>
                    🪑 {order.orderType}
                  </div>
                  <div style={styles.orderDetail}>
                    💰 ${order.totalAmount}
                  </div>
                </div>
                {nextStatus[order.orderStatus] && (
                  <button
                    style={{
                      ...styles.actionBtn,
                      background: statusColors[nextStatus[order.orderStatus]]
                    }}
                    onClick={() => updateStatus(order,
                      nextStatus[order.orderStatus])}
                  >
                    {nextStatusLabel[order.orderStatus]}
                  </button>
                )}
              </div>
            ))}
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
  menuItem: {
    padding: '12px 20px', color: 'white',
    background: 'rgba(245,166,35,0.15)',
    borderLeft: '3px solid #f5a623', fontSize: '14px',
  },
  refreshBtn: {
    padding: '12px 20px', cursor: 'pointer',
    color: '#aaa', fontSize: '14px', marginTop: '10px',
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
  roleBadge: {
    background: '#f5a623', color: 'white', padding: '6px 16px',
    borderRadius: '20px', fontWeight: '600', fontSize: '13px',
  },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px', marginBottom: '25px',
  },
  summaryCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  summaryCount: { fontSize: '48px', fontWeight: '800' },
  summaryLabel: { fontSize: '14px', color: '#888', fontWeight: '600', marginTop: '5px' },
  emptyState: {
    textAlign: 'center', padding: '80px', background: 'white',
    borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  emptyIcon: { fontSize: '64px', marginBottom: '20px' },
  ordersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
  },
  orderCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '15px',
  },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  statusBadge: {
    padding: '4px 12px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  orderDetails: { marginBottom: '15px' },
  orderDetail: { fontSize: '14px', color: '#555', padding: '4px 0' },
  actionBtn: {
    width: '100%', padding: '12px', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
  },
};

export default KitchenDashboard;