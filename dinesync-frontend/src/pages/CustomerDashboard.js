import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import api from '../services/api';
import { FaSignOutAlt, FaUtensils, FaClipboardList, FaShoppingCart, FaTimes } from 'react-icons/fa';

const CustomerDashboard = () => {
useBlockBackNav(); 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchMenu();
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/api/menu-items');
      setMenuItems(res.data.filter(i => i.availability === 'AVAILABLE'));
    } catch (err) { console.error(err); }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.itemId === item.itemId);
    if (existing) {
      setCart(cart.map(c =>
        c.itemId === item.itemId ? {...c, qty: c.qty + 1} : c
      ));
    } else {
      setCart([...cart, {...item, qty: 1}]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const updateQty = (itemId, qty) => {
    if (qty === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c =>
        c.itemId === itemId ? {...c, qty} : c
      ));
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
  );

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const orderRes = await api.post('/api/orders', {
        customerId: 1,
        orderType,
        orderStatus: 'RECEIVED',
        totalAmount: totalAmount.toFixed(2),
      });

      // Auto send order confirmation email
      try {
        await api.post('/api/email/order-confirmation', {
          to: user?.email,
          orderId: orderRes.data.orderId,
          orderType,
          amount: parseFloat(totalAmount.toFixed(2)),
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }

      setCart([]);
      setShowCart(false);
      setOrderPlaced(true);
      fetchMyOrders();
      setTimeout(() => setOrderPlaced(false), 3000);
    } catch (err) { console.error(err); }
  };

  const categories = ['ALL', ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = selectedCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  const statusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623',
    READY: '#9b59b6', DELIVERED: '#2ecc71', CANCELLED: '#e74c3c',
  };

  const statusEmoji = {
    RECEIVED: '📋', PREPARING: '👨‍🍳', READY: '✅', DELIVERED: '🚀', CANCELLED: '❌',
  };

  const categoryColors = {
    MAIN_COURSE: '#e74c3c', STARTER: '#f5a623',
    DESSERT: '#9b59b6', DRINKS: '#3498db', SIDES: '#2ecc71',
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.topNav}>
        <div style={styles.navBrand}>🍽️ <span style={styles.brandText}>DineSync</span></div>
        <div style={styles.navTabs}>
          <div
            style={activeTab === 'menu' ? styles.navTabActive : styles.navTab}
            onClick={() => setActiveTab('menu')}>
            <FaUtensils /> Menu
          </div>
          <div
            style={activeTab === 'orders' ? styles.navTabActive : styles.navTab}
            onClick={() => setActiveTab('orders')}>
            <FaClipboardList /> My Orders
          </div>
        </div>
        <div style={styles.navRight}>
          <div style={styles.cartBtn} onClick={() => setShowCart(true)}>
            <FaShoppingCart />
            {cart.length > 0 &&
              <span style={styles.cartBadge}>{cart.length}</span>}
            Cart {cart.length > 0 && `($${totalAmount.toFixed(2)})`}
          </div>
          <div style={styles.userInfo}>
            👤 {user?.email}
          </div>
          <div style={styles.logoutBtn}
            onClick={() => { logout(); navigate('/login'); }}>
            <FaSignOutAlt />
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {orderPlaced && (
        <div style={styles.successBanner}>
          🎉 Order placed successfully! Kitchen has been notified.
        </div>
      )}

      <div style={styles.main}>
        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>Our Menu</h1>
              <p style={styles.pageSubtitle}>
                {filteredMenu.length} items available
              </p>
            </div>

            {/* Category Filter */}
            <div style={styles.categoryFilter}>
              {categories.map(cat => (
                <button key={cat}
                  style={{
                    ...styles.catBtn,
                    background: selectedCategory === cat ? '#f5a623' : 'white',
                    color: selectedCategory === cat ? 'white' : '#333',
                  }}
                  onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div style={styles.menuGrid}>
              {filteredMenu.map(item => (
                <div key={item.itemId} style={styles.menuCard}>
                  <div style={{
                    ...styles.menuCardHeader,
                    background: categoryColors[item.category] || '#888'
                  }}>
                    <span style={styles.menuCardEmoji}>🍽️</span>
                    <span style={styles.menuCardCategory}>{item.category}</span>
                  </div>
                  <div style={styles.menuCardBody}>
                    <h3 style={styles.menuItemName}>{item.dishName}</h3>
                    {item.variant && (
                      <p style={styles.menuItemVariant}>Variant: {item.variant}</p>
                    )}
                    <div style={styles.menuItemMeta}>
                      <span style={styles.spiceLevel}>
                        🌶️ {item.spiceLevel}
                      </span>
                      <span style={styles.stockBadge}>
                        Stock: {item.stockQuantity}
                      </span>
                    </div>
                    <div style={styles.menuCardFooter}>
                      <span style={styles.menuItemPrice}>
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                      <button style={styles.addToCartBtn}
                        onClick={() => addToCart(item)}>
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>My Orders</h1>
              <p style={styles.pageSubtitle}>
                Track your order status in real time
              </p>
            </div>
            <div style={styles.ordersGrid}>
              {orders.map(order => (
                <div key={order.orderId} style={{
                  ...styles.orderCard,
                  borderLeft: `5px solid ${statusColors[order.orderStatus]}`
                }}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>
                      Order #{order.orderId}
                    </span>
                    <span style={{
                      ...styles.orderStatusBadge,
                      background: statusColors[order.orderStatus]
                    }}>
                      {statusEmoji[order.orderStatus]} {order.orderStatus}
                    </span>
                  </div>
                  <div style={styles.orderMeta}>
                    <span>🛒 {order.orderType}</span>
                    <span>💰 ${order.totalAmount}</span>
                  </div>
                  {/* Order Progress Bar */}
                  <div style={styles.progressBar}>
                    {['RECEIVED','PREPARING','READY','DELIVERED'].map((s, i) => (
                      <div key={s} style={styles.progressStep}>
                        <div style={{
                          ...styles.progressDot,
                          background: ['RECEIVED','PREPARING','READY','DELIVERED']
                            .indexOf(order.orderStatus) >= i
                            ? statusColors[s] : '#ddd'
                        }} />
                        <div style={styles.progressLabel}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div style={styles.emptyOrders}>
                  <div style={{fontSize:'64px'}}>🛒</div>
                  <h2>No orders yet</h2>
                  <p>Browse our menu and place your first order!</p>
                  <button style={styles.browseBtn}
                    onClick={() => setActiveTab('menu')}>
                    Browse Menu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div style={styles.modal}>
          <div style={styles.cartModal}>
            <div style={styles.cartHeader}>
              <h2 style={styles.cartTitle}>🛒 Your Cart</h2>
              <button style={styles.closeBtn}
                onClick={() => setShowCart(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.orderTypeRow}>
              <label style={styles.label}>Order Type:</label>
              <select style={styles.select} value={orderType}
                onChange={e => setOrderType(e.target.value)}>
                {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                  <option key={t}>{t}</option>)}
              </select>
            </div>

            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                Cart is empty. Add items from menu!
              </div>
            ) : (
              <>
                <div style={styles.cartItems}>
                  {cart.map(item => (
                    <div key={item.itemId} style={styles.cartItem}>
                      <div style={styles.cartItemName}>{item.dishName}</div>
                      <div style={styles.cartItemControls}>
                        <button style={styles.qtyBtn}
                          onClick={() => updateQty(item.itemId, item.qty - 1)}>
                          -
                        </button>
                        <span style={styles.qty}>{item.qty}</span>
                        <button style={styles.qtyBtn}
                          onClick={() => updateQty(item.itemId, item.qty + 1)}>
                          +
                        </button>
                        <span style={styles.cartItemPrice}>
                          ${(parseFloat(item.price) * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.cartTotal}>
                  <strong>Total: ${totalAmount.toFixed(2)}</strong>
                </div>
                <button style={styles.placeOrderBtn} onClick={placeOrder}>
                  Place Order — ${totalAmount.toFixed(2)}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  topNav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1a1a2e', padding: '0 30px', height: '60px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' },
  brandText: { color: '#f5a623', fontWeight: '800' },
  navTabs: { display: 'flex', gap: '5px' },
  navTab: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 20px', color: '#aaa', cursor: 'pointer',
    borderRadius: '6px', fontSize: '14px',
  },
  navTabActive: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 20px', color: 'white', cursor: 'pointer',
    borderRadius: '6px', fontSize: '14px',
    background: 'rgba(245,166,35,0.2)',
    border: '1px solid #f5a623',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  cartBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: '-8px', right: '-8px',
    background: '#e74c3c', color: 'white', borderRadius: '50%',
    width: '20px', height: '20px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '11px',
  },
  userInfo: { color: '#aaa', fontSize: '13px' },
  logoutBtn: {
    color: '#e74c3c', cursor: 'pointer', fontSize: '18px', padding: '5px',
  },
  successBanner: {
    background: '#2ecc71', color: 'white', padding: '12px',
    textAlign: 'center', fontSize: '14px', fontWeight: '600',
  },
  main: { flex: 1, background: '#f0f2f5', overflow: 'auto', padding: '30px' },
  pageHeader: { marginBottom: '25px' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  pageSubtitle: { color: '#888', margin: '5px 0 0', fontSize: '14px' },
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
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
  },
  menuCardHeader: {
    padding: '30px 20px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
  },
  menuCardEmoji: { fontSize: '40px' },
  menuCardCategory: {
    color: 'white', fontSize: '11px', fontWeight: '700',
    background: 'rgba(0,0,0,0.2)', padding: '3px 10px',
    borderRadius: '10px',
  },
  menuCardBody: { padding: '15px' },
  menuItemName: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 6px' },
  menuItemVariant: { fontSize: '12px', color: '#888', margin: '0 0 8px' },
  menuItemMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  spiceLevel: { fontSize: '12px', color: '#e74c3c' },
  stockBadge: { fontSize: '12px', color: '#888' },
  menuCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  menuItemPrice: { fontSize: '20px', fontWeight: '800', color: '#2ecc71' },
  addToCartBtn: {
    background: '#f5a623', color: 'white', border: 'none',
    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
  },
  ordersGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  orderStatusBadge: {
    padding: '6px 14px', borderRadius: '20px',
    color: 'white', fontSize: '13px', fontWeight: '600',
  },
  orderMeta: {
    display: 'flex', gap: '20px', fontSize: '14px',
    color: '#555', marginBottom: '15px',
  },
  progressBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  progressDot: { width: '16px', height: '16px', borderRadius: '50%', marginBottom: '5px' },
  progressLabel: { fontSize: '11px', color: '#888', textAlign: 'center' },
  emptyOrders: {
    textAlign: 'center', padding: '60px', background: 'white',
    borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  browseBtn: {
    marginTop: '15px', background: '#f5a623', color: 'white',
    border: 'none', padding: '12px 24px', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', fontSize: '14px',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  cartModal: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '500px', maxHeight: '80vh', overflow: 'auto',
  },
  cartHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  cartTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  closeBtn: {
    background: '#f0f2f5', border: 'none', padding: '8px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px',
  },
  orderTypeRow: {
    display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px',
  },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  select: {
    padding: '8px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  emptyCart: { textAlign: 'center', color: '#888', padding: '30px' },
  cartItems: { marginBottom: '15px' },
  cartItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  cartItemName: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e' },
  cartItemControls: { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyBtn: {
    width: '28px', height: '28px', border: '2px solid #e0e0e0',
    borderRadius: '6px', cursor: 'pointer', background: 'white',
    fontWeight: '700', fontSize: '16px',
  },
  qty: { fontSize: '16px', fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  cartItemPrice: { fontSize: '14px', fontWeight: '700', color: '#2ecc71', minWidth: '60px', textAlign: 'right' },
  cartTotal: {
    textAlign: 'right', fontSize: '18px', fontWeight: '700',
    color: '#1a1a2e', padding: '15px 0', borderTop: '2px solid #f0f0f0',
  },
  placeOrderBtn: {
    width: '100%', padding: '15px', background: '#f5a623',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    marginTop: '10px',
  },
};

export default CustomerDashboard;