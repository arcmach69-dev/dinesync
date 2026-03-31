import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();
  useBlockBackNav();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data.filter(o =>
        o.orderStatus !== 'DELIVERED' &&
        o.orderStatus !== 'CANCELLED'
      ));
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (order, newStatus) => {
  try {
    await api.put(`/api/orders/${order.orderId}`, {
      ...order, orderStatus: newStatus
    });

    // Auto notify customer when Kitchen marks READY
    if (newStatus === 'READY') {
      
      // Send SMS if customer phone exists
      if (order.customerPhone) {
        await api.post('/api/sms/order-ready', {
          to: order.customerPhone,
          orderId: order.orderId,
          customerName: order.customerName || 'Customer',
        }).catch(err => console.log('SMS failed:', err));
      }

      // Send email notification to restaurant email
      // as confirmation that order is ready
      await api.post('/api/email/order-ready', {
        to: 'admin@dinesync.com',
        orderId: order.orderId,
        customerName: order.customerName || 'Walk-in Customer',
        orderType: order.orderType,
        amount: order.totalAmount,
      }).catch(err => console.log('Email failed:', err));

      alert(`✅ Order #${order.orderId} is READY! Customer notified automatically.`);
    }

    fetchOrders();
  } catch (err) { console.error(err); }
};

  const statusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623', READY: '#2ecc71',
  };
  const statusEmoji = {
    RECEIVED: '📋', PREPARING: '👨‍🍳', READY: '✅',
  };
  const nextStatus = { RECEIVED: 'PREPARING', PREPARING: 'READY' };
  const nextLabel = {
    RECEIVED: '👨‍🍳 Start Preparing',
    PREPARING: '✅ Mark Ready',
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.brand}>🍽️ DineSync — Kitchen</div>
          {/* Back button for Admin/Manager */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button style={styles.backBtn}
              onClick={() => goToDashboard()}>
              ← Back to Dashboard
            </button>
          )}
        </div>
        <div style={styles.topRight}>
          <span style={styles.autoRefresh}>
            🔄 Auto-refresh every 5 seconds
          </span>
          <span style={styles.userEmail}>{user?.email}</span>
          <button style={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.title}>👨‍🍳 Kitchen Order Queue</h1>
          <div style={styles.stats}>
            {['RECEIVED','PREPARING','READY'].map(status => (
              <div key={status} style={{
                ...styles.statBadge,
                background: statusColors[status]
              }}>
                {statusEmoji[status]} {status}:{' '}
                {orders.filter(o => o.orderStatus === status).length}
              </div>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <div style={{fontSize:'64px'}}>🍽️</div>
            <h2 style={{color:'#1a1a2e', margin:'15px 0 5px'}}>
              No active orders
            </h2>
            <p style={{color:'#888'}}>
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map(order => (
              <div key={order.orderId} style={{
                ...styles.orderCard,
                borderTop: `5px solid ${statusColors[order.orderStatus]}`
              }}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>
                    Order #{order.orderId}
                  </span>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusColors[order.orderStatus]
                  }}>
                    {statusEmoji[order.orderStatus]} {order.orderStatus}
                  </span>
                </div>
                <div style={styles.orderMeta}>
                  🛒 {order.orderType}
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
                <div style={styles.orderAmount}>
                  💰 ${order.totalAmount}
                </div>
                {nextStatus[order.orderStatus] && (
                  <button style={{
                    ...styles.actionBtn,
                    background: statusColors[
                      nextStatus[order.orderStatus]
                    ]
                  }}
                    onClick={() => updateStatus(
                      order, nextStatus[order.orderStatus]
                    )}>
                    {nextLabel[order.orderStatus]}
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
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    fontFamily: "'Segoe UI', sans-serif", background: '#f0f2f5',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a1a2e', padding: '0 30px', height: '60px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  brand: { color: '#f5a623', fontWeight: '800', fontSize: '20px' },
  backBtn: {
    background: 'rgba(245,166,35,0.15)', border: '1px solid #f5a623',
    color: '#f5a623', padding: '6px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  topRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  autoRefresh: { color: '#2ecc71', fontSize: '13px', fontWeight: '600' },
  userEmail: { color: '#aaa', fontSize: '13px' },
  logoutBtn: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
    fontWeight: '600', fontSize: '13px',
  },
  main: { flex: 1, overflow: 'auto', padding: '30px' },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'white', padding: '20px 30px', borderRadius: '12px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  stats: { display: 'flex', gap: '10px' },
  statBadge: {
    padding: '6px 14px', color: 'white',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '80px', background: 'white',
    borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  ordersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
  },
  orderCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  orderId: { fontSize: '18px', fontWeight: '800', color: '#1a1a2e' },
  statusBadge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '11px', fontWeight: '600',
  },
  orderMeta: { fontSize: '13px', color: '#888', marginBottom: '5px' },
  customerInfo: {
    fontSize: '13px', color: '#3498db',
    fontWeight: '600', marginBottom: '5px',
  },
  notesInfo: {
    fontSize: '12px', color: '#888', fontStyle: 'italic',
    marginBottom: '8px', padding: '5px 8px',
    background: '#f8f9fa', borderRadius: '6px',
  },
  orderAmount: {
    fontSize: '16px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '15px',
  },
  actionBtn: {
    width: '100%', padding: '12px', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    fontWeight: '700', fontSize: '14px',
  },
};

export default KitchenDashboard;