import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlockBackNav } from '../context/useBlockBackNav';
import api from '../services/api';
import {
  FaSignOutAlt, FaUtensils, FaClipboardList,
  FaShoppingCart, FaTimes, FaChevronLeft, FaChevronRight, FaStar
} from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useBlockBackNav();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAd, setShowAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [realOffers, setRealOffers] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  const demoSpecials = [
    {
      emoji: '🍗',
      title: "Today's Special!",
      subtitle: 'Chicken Biryani',
      description: 'Our signature dish — premium basmati rice with tender chicken. Chef\'s special recipe made fresh daily!',
      badge: "CHEF'S PICK",
      badgeColor: '#e74c3c',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)',
      accent: '#f5a623',
      cta: 'Order Now →',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    },
    {
      emoji: '🥘',
      title: 'Weekend Exclusive',
      subtitle: 'Mutton Biryani',
      description: 'Slow-cooked tender mutton with aromatic spices. Available this weekend only — don\'t miss out!',
      badge: 'LIMITED TIME',
      badgeColor: '#9b59b6',
      gradient: 'linear-gradient(135deg, #16213e 0%, #8e44ad 100%)',
      accent: '#2ecc71',
      cta: 'Order Now →',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
    },
    {
      emoji: '🎉',
      title: 'Happy Hours',
      subtitle: '3 PM — 6 PM Daily',
      description: 'Get 15% off on all beverages and starters. Every single day from 3 to 6 PM!',
      badge: 'DAILY DEAL',
      badgeColor: '#3498db',
      gradient: 'linear-gradient(135deg, #0f3460 0%, #3498db 100%)',
      accent: '#f5a623',
      cta: 'Browse Menu →',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    },
  ];

  useEffect(() => {
    fetchMenu();
    fetchMyOrders();
    fetchOffers();
    const interval = setInterval(fetchMyOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await api.get('/api/discounts/active');
      setRealOffers(res.data);
      setTimeout(() => setShowAd(true), 1000);
    } catch (err) {
      setTimeout(() => setShowAd(true), 1000);
    }
  };

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

  const allAds = [
    ...demoSpecials,
    ...realOffers.map(offer => ({
      emoji: offer.type === 'COUPON' ? '🎟️' : '🎁',
      title: offer.type === 'COUPON' ? 'Exclusive Coupon!' : 'Special Offer!',
      subtitle: offer.title,
      description: offer.description || `Save ${offer.discountPercent
        ? offer.discountPercent + '%' : '$' + offer.discountAmount} on orders above $${offer.minimumOrder}!`,
      badge: offer.type === 'COUPON' ? 'CODE: ' + offer.couponCode : 'AUTO APPLIED',
      badgeColor: offer.type === 'COUPON' ? '#9b59b6' : '#2ecc71',
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)',
      accent: offer.type === 'COUPON' ? '#9b59b6' : '#2ecc71',
      cta: 'Order & Save →',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    }))
  ];

  const nextAd = () => setCurrentAdIndex(p => p === allAds.length - 1 ? 0 : p + 1);
  const prevAd = () => setCurrentAdIndex(p => p === 0 ? allAds.length - 1 : p - 1);
  const handleAdCTA = () => { setShowAd(false); setActiveTab('menu'); };

  const addToCart = (item) => {
    const existing = cart.find(c => c.itemId === item.itemId);
    if (existing) {
      setCart(cart.map(c =>
        c.itemId === item.itemId ? {...c, qty: c.qty + 1} : c));
    } else {
      setCart([...cart, {...item, qty: 1}]);
    }
  };

  const removeFromCart = (itemId) => setCart(cart.filter(c => c.itemId !== itemId));

  const updateQty = (itemId, qty) => {
    if (qty === 0) removeFromCart(itemId);
    else setCart(cart.map(c => c.itemId === itemId ? {...c, qty} : c));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) * item.qty), 0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const formatPhone = (value) => {
    const input = value.replace(/\D/g, '');
    if (!input) return '';
    if (input.length <= 3) return `(${input}`;
    if (input.length <= 6) return `(${input.slice(0,3)}) ${input.slice(3)}`;
    return `(${input.slice(0,3)}) ${input.slice(3,6)}-${input.slice(6,10)}`;
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (customerPhone) {
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(customerPhone)) {
        alert('Please enter valid US phone: (555) 123-4567');
        return;
      }
    }
    try {
      await api.post('/api/orders', {
        customerId: 1, orderType,
        orderStatus: 'RECEIVED',
        totalAmount: totalAmount.toFixed(2),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null,
      });
      setCart([]); setShowCart(false);
      setCustomerName(''); setCustomerPhone(''); setNotes('');
      setOrderPlaced(true);
      fetchMyOrders();
      setTimeout(() => setOrderPlaced(false), 4000);
    } catch (err) { console.error(err); }
  };

  const categories = ['ALL', ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = selectedCategory === 'ALL'
    ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  const statusColors = {
    RECEIVED: '#3498db', PREPARING: '#f5a623',
    READY: '#9b59b6', DELIVERED: '#2ecc71', CANCELLED: '#e74c3c',
  };
  const statusEmoji = {
    RECEIVED: '📋', PREPARING: '👨‍🍳',
    READY: '✅', DELIVERED: '🚀', CANCELLED: '❌',
  };
  const categoryColors = {
    MAIN_COURSE: '#e74c3c', STARTER: '#f5a623',
    DESSERT: '#9b59b6', DRINKS: '#3498db', SIDES: '#2ecc71',
  };
  const defaultImages = {
    MAIN_COURSE: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    STARTER: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    DESSERT: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
    DRINKS: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    SIDES: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
  };

  const spiceEmoji = { MILD: '🟢', MEDIUM: '🟡', HIGH: '🔴', NOT_APPLICABLE: '⚪' };
  const currentAd = allAds[currentAdIndex];

  return (
    <div style={styles.container}>

      {/* ═══ AD POPUP ═══ */}
      {showAd && currentAd && (
        <div style={styles.adOverlay}>
          <div style={styles.adModal}>
            {/* Left — Image */}
            <div style={styles.adLeft}>
              <img
                src={currentAd.image}
                alt={currentAd.subtitle}
                style={styles.adImage}
                onError={e => {
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
                }}
              />
              <div style={{
                ...styles.adImageOverlay,
                background: currentAd.gradient.replace('135deg', '180deg'),
              }} />
            </div>

            {/* Right — Content */}
            <div style={{
              ...styles.adRight,
              background: currentAd.gradient,
            }}>
              <button style={styles.adClose} onClick={() => setShowAd(false)}>
                <FaTimes />
              </button>

              <div style={{
                ...styles.adBadge,
                background: currentAd.badgeColor,
              }}>
                {currentAd.badge}
              </div>

              <div style={styles.adEmoji}>{currentAd.emoji}</div>
              <div style={styles.adLabel}>{currentAd.title}</div>
              <div style={{
                ...styles.adSubtitle,
                color: currentAd.accent,
              }}>
                {currentAd.subtitle}
              </div>
              <div style={styles.adDesc}>{currentAd.description}</div>

              <button style={{
                ...styles.adCTA,
                background: currentAd.accent,
                color: '#1a1a2e',
              }} onClick={handleAdCTA}>
                {currentAd.cta}
              </button>

              {allAds.length > 1 && (
                <div style={styles.adNav}>
                  <button style={styles.adNavBtn} onClick={prevAd}>
                    <FaChevronLeft />
                  </button>
                  <div style={styles.adDots}>
                    {allAds.map((_, i) => (
                      <div key={i}
                        style={{
                          ...styles.adDot,
                          background: i === currentAdIndex
                            ? currentAd.accent : 'rgba(255,255,255,0.3)',
                          width: i === currentAdIndex ? '20px' : '8px',
                        }}
                        onClick={() => setCurrentAdIndex(i)}
                      />
                    ))}
                  </div>
                  <button style={styles.adNavBtn} onClick={nextAd}>
                    <FaChevronRight />
                  </button>
                </div>
              )}
              <div style={styles.adCounter}>
                {currentAdIndex + 1} / {allAds.length} offers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOP NAV ═══ */}
      <div style={styles.topNav}>
        <div style={styles.navBrand}>
          🍽️ <span style={styles.brandText}>DineSync</span>
        </div>
        <div style={styles.navTabs}>
          {[
            { id: 'menu', label: 'Menu', icon: <FaUtensils /> },
            { id: 'orders', label: 'My Orders', icon: <FaClipboardList /> },
          ].map(tab => (
            <div key={tab.id}
              style={activeTab === tab.id ? styles.navTabActive : styles.navTab}
              onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.offersBtn}
            onClick={() => { setCurrentAdIndex(0); setShowAd(true); }}>
            🎁 Offers & Deals
          </button>
          <div style={styles.cartBtn} onClick={() => setShowCart(true)}>
            <FaShoppingCart />
            {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            <span>Cart</span>
            {cart.length > 0 && (
              <span style={styles.cartTotal2}>${totalAmount.toFixed(2)}</span>
            )}
          </div>
          <div style={styles.userBadge}>👤 {user?.email?.split('@')[0]}</div>
          <div style={styles.logoutBtn}
            onClick={() => { logout(); navigate('/login', { replace: true }); }}>
            <FaSignOutAlt />
          </div>
        </div>
      </div>

      {/* Success banner */}
      {orderPlaced && (
        <div style={styles.successBanner}>
          🎉 Order placed! Kitchen has been notified. Track it in My Orders.
        </div>
      )}

      <div style={styles.main}>

        {/* ═══ MENU TAB ═══ */}
        {activeTab === 'menu' && (
          <div>
            {/* Hero banner */}
            <div style={styles.heroBanner}>
              <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>
                  Welcome to <span style={styles.heroAccent}>DineSync</span>
                </h1>
                <p style={styles.heroSubtitle}>
                  Fresh ingredients. Authentic flavors. Served with love. 🍽️
                </p>
                <button style={styles.heroBtn}
                  onClick={() => { setCurrentAdIndex(0); setShowAd(true); }}>
                  🎁 View Today's Offers
                </button>
              </div>
              <div style={styles.heroImage}>
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"
                  alt="Restaurant"
                  style={styles.heroImg}
                />
              </div>
            </div>

            {/* Category filter */}
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Our Menu</h2>
              <p style={styles.sectionSub}>
                {filteredMenu.length} items available
              </p>
            </div>
            <div style={styles.categoryFilter}>
              {categories.map(cat => (
                <button key={cat}
                  style={{
                    ...styles.catBtn,
                    background: selectedCategory === cat ? '#f5a623' : 'white',
                    color: selectedCategory === cat ? 'white' : '#555',
                    borderColor: selectedCategory === cat ? '#f5a623' : '#e0e0e0',
                    boxShadow: selectedCategory === cat
                      ? '0 4px 12px rgba(245,166,35,0.3)' : 'none',
                  }}
                  onClick={() => setSelectedCategory(cat)}>
                  {cat === 'ALL' && '🍴 '}
                  {cat === 'MAIN_COURSE' && '🍛 '}
                  {cat === 'STARTER' && '🥗 '}
                  {cat === 'DESSERT' && '🍮 '}
                  {cat === 'DRINKS' && '🥤 '}
                  {cat === 'SIDES' && '🫓 '}
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Menu grid */}
            <div style={styles.menuGrid}>
              {filteredMenu.map(item => {
                const inCart = cart.find(c => c.itemId === item.itemId);
                return (
                  <div key={item.itemId}
                    style={{
                      ...styles.menuCard,
                      transform: hoveredItem === item.itemId
                        ? 'translateY(-4px)' : 'translateY(0)',
                      boxShadow: hoveredItem === item.itemId
                        ? '0 12px 30px rgba(0,0,0,0.15)'
                        : '0 4px 15px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={() => setHoveredItem(item.itemId)}
                    onMouseLeave={() => setHoveredItem(null)}>

                    {/* Image */}
                    <div style={styles.cardImageWrapper}>
                      <img
                        src={item.imageUrl || defaultImages[item.category]}
                        alt={item.dishName}
                        style={styles.cardImage}
                        onError={e => {
                          e.target.src = defaultImages[item.category] ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      <div style={{
                        ...styles.catTag,
                        background: categoryColors[item.category] || '#888',
                      }}>
                        {item.category.replace('_', ' ')}
                      </div>
                      {inCart && (
                        <div style={styles.inCartBadge}>
                          ✓ {inCart.qty} in cart
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={styles.cardBody}>
                      <h3 style={styles.itemName}>{item.dishName}</h3>
                      {item.variant && (
                        <p style={styles.itemVariant}>📦 {item.variant}</p>
                      )}

                      <div style={styles.itemMeta}>
                        <span style={styles.spiceTag}>
                          {spiceEmoji[item.spiceLevel]} {item.spiceLevel}
                        </span>
                        <div style={styles.stars}>
                          <FaStar style={{color:'#f5a623', fontSize:'11px'}} />
                          <FaStar style={{color:'#f5a623', fontSize:'11px'}} />
                          <FaStar style={{color:'#f5a623', fontSize:'11px'}} />
                          <FaStar style={{color:'#f5a623', fontSize:'11px'}} />
                          <FaStar style={{color:'#ddd', fontSize:'11px'}} />
                        </div>
                      </div>

                      <div style={styles.cardFooter}>
                        <span style={styles.itemPrice}>
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                        <button style={{
                          ...styles.addBtn,
                          background: inCart ? '#2ecc71' : '#f5a623',
                        }}
                          onClick={() => addToCart(item)}>
                          {inCart ? `✓ Add More` : '+ Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Orders</h2>
              <p style={styles.sectionSub}>Live tracking — updates every 15 seconds</p>
            </div>
            <div style={styles.ordersGrid}>
              {orders.map(order => (
                <div key={order.orderId} style={{
                  ...styles.orderCard,
                  borderLeft: `5px solid ${statusColors[order.orderStatus]}`
                }}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>Order #{order.orderId}</span>
                    <span style={{
                      ...styles.statusBadge,
                      background: statusColors[order.orderStatus]
                    }}>
                      {statusEmoji[order.orderStatus]} {order.orderStatus}
                    </span>
                  </div>
                  <div style={styles.orderMeta}>
                    <span>🛒 {order.orderType}</span>
                    <span style={{fontWeight:'700', color:'#2ecc71'}}>
                      💰 ${order.totalAmount}
                    </span>
                  </div>
                  {order.customerName && (
                    <div style={styles.custInfo}>
                      👤 {order.customerName}
                      {order.customerPhone && ` • 📞 ${order.customerPhone}`}
                    </div>
                  )}
                  {order.notes && (
                    <div style={styles.notesInfo}>📝 {order.notes}</div>
                  )}
                  {/* Progress */}
                  <div style={styles.progressWrapper}>
                    {['RECEIVED','PREPARING','READY','DELIVERED'].map((s, i) => {
                      const idx = ['RECEIVED','PREPARING','READY','DELIVERED']
                        .indexOf(order.orderStatus);
                      const done = idx >= i;
                      return (
                        <div key={s} style={styles.progressStep}>
                          <div style={{
                            ...styles.progressCircle,
                            background: done ? statusColors[s] : '#e0e0e0',
                            boxShadow: done
                              ? `0 0 0 3px ${statusColors[s]}30` : 'none',
                          }}>
                            {done ? '✓' : ''}
                          </div>
                          {i < 3 && (
                            <div style={{
                              ...styles.progressLine,
                              background: idx > i ? statusColors[s] : '#e0e0e0',
                            }} />
                          )}
                          <div style={{
                            ...styles.progressLabel,
                            color: done ? statusColors[s] : '#aaa',
                            fontWeight: done ? '600' : '400',
                          }}>
                            {s}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div style={styles.emptyState}>
                  <div style={{fontSize:'72px', marginBottom:'15px'}}>🛒</div>
                  <h2 style={{color:'#1a1a2e', margin:'0 0 8px'}}>
                    No orders yet
                  </h2>
                  <p style={{color:'#888', marginBottom:'20px'}}>
                    Browse our menu and place your first order!
                  </p>
                  <button style={styles.browseBtn}
                    onClick={() => setActiveTab('menu')}>
                    Browse Menu →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ CART MODAL ═══ */}
      {showCart && (
        <div style={styles.modal}>
          <div style={styles.cartModal}>
            <div style={styles.cartHeader}>
              <div>
                <h2 style={styles.cartTitle}>🛒 Your Cart</h2>
                <p style={styles.cartSub}>{cartCount} items</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setShowCart(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Order details */}
            <div style={styles.orderDetails}>
              <div style={styles.detailRow}>
                <label style={styles.detailLabel}>Order Type</label>
                <select style={styles.detailInput} value={orderType}
                  onChange={e => setOrderType(e.target.value)}>
                  {['DINE_IN','TAKEAWAY','ONLINE'].map(t =>
                    <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.detailRow}>
                <label style={styles.detailLabel}>Your Name</label>
                <input style={styles.detailInput}
                  placeholder="Optional"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div style={styles.detailRow}>
                <label style={styles.detailLabel}>Phone</label>
                <input style={styles.detailInput}
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  maxLength={14}
                  onChange={e => setCustomerPhone(formatPhone(e.target.value))} />
              </div>
              <div style={styles.detailRow}>
                <label style={styles.detailLabel}>Notes</label>
                <input style={styles.detailInput}
                  placeholder="No onions, extra spicy..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            {/* Cart items */}
            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={{fontSize:'48px'}}>🛒</div>
                <p>Cart is empty — add items from menu!</p>
              </div>
            ) : (
              <>
                <div style={styles.cartItemsList}>
                  {cart.map(item => (
                    <div key={item.itemId} style={styles.cartItem}>
                      <img
                        src={item.imageUrl || defaultImages[item.category]}
                        alt={item.dishName}
                        style={styles.cartItemImg}
                        onError={e => {
                          e.target.src = defaultImages[item.category];
                        }}
                      />
                      <div style={styles.cartItemInfo}>
                        <div style={styles.cartItemName}>{item.dishName}</div>
                        <div style={styles.cartItemPrice}>
                          ${parseFloat(item.price).toFixed(2)} each
                        </div>
                      </div>
                      <div style={styles.qtyControls}>
                        <button style={styles.qtyBtn}
                          onClick={() => updateQty(item.itemId, item.qty - 1)}>
                          −
                        </button>
                        <span style={styles.qtyNum}>{item.qty}</span>
                        <button style={styles.qtyBtn}
                          onClick={() => updateQty(item.itemId, item.qty + 1)}>
                          +
                        </button>
                      </div>
                      <div style={styles.itemTotal}>
                        ${(parseFloat(item.price) * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.cartSummary}>
                  <div style={styles.summaryRow}>
                    <span>Subtotal ({cartCount} items)</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{color:'#888', fontSize:'12px'}}>
                      Tax calculated at checkout
                    </span>
                  </div>
                  <div style={styles.summaryDivider} />
                  <div style={{...styles.summaryRow, fontWeight:'800', fontSize:'18px', color:'#1a1a2e'}}>
                    <span>Total</span>
                    <span style={{color:'#2ecc71'}}>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button style={styles.placeOrderBtn} onClick={placeOrder}>
                  🛒 Place Order — ${totalAmount.toFixed(2)}
                </button>
                <p style={styles.cartNote}>
                  * Tax + discounts applied at billing
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif",
  },

  // AD POPUP
  adOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000,
  },
  adModal: {
    display: 'flex', width: '820px', maxWidth: '95vw',
    borderRadius: '20px', overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
  },
  adLeft: { position: 'relative', width: '340px', flexShrink: 0 },
  adImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  adImageOverlay: {
    position: 'absolute', inset: 0, opacity: 0.4,
  },
  adRight: {
    flex: 1, padding: '35px', position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center',
  },
  adClose: {
    position: 'absolute', top: '12px', right: '12px',
    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
    width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer',
    fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  adBadge: {
    padding: '5px 14px', borderRadius: '20px', color: 'white',
    fontSize: '10px', fontWeight: '800', letterSpacing: '1px',
    marginBottom: '15px',
  },
  adEmoji: { fontSize: '60px', marginBottom: '10px' },
  adLabel: {
    fontSize: '12px', color: 'rgba(255,255,255,0.65)',
    fontWeight: '600', letterSpacing: '2px',
    textTransform: 'uppercase', marginBottom: '6px',
  },
  adSubtitle: { fontSize: '26px', fontWeight: '800', marginBottom: '12px' },
  adDesc: {
    fontSize: '13px', color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.6', marginBottom: '20px',
  },
  adCTA: {
    border: 'none', padding: '13px 30px', borderRadius: '50px',
    fontSize: '15px', fontWeight: '800', cursor: 'pointer',
    width: '100%', marginBottom: '15px',
  },
  adNav: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  adNavBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
    width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
  },
  adDots: { display: 'flex', gap: '5px', alignItems: 'center' },
  adDot: { height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s' },
  adCounter: { fontSize: '11px', color: 'rgba(255,255,255,0.4)' },

  // TOP NAV
  topNav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1a1a2e', padding: '0 30px', height: '64px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.3)', flexShrink: 0,
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px' },
  brandText: { color: '#f5a623', fontWeight: '800', letterSpacing: '-0.5px' },
  navTabs: { display: 'flex', gap: '4px' },
  navTab: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 18px', color: '#888', cursor: 'pointer',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500',
  },
  navTabActive: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 18px', color: 'white', cursor: 'pointer',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.5)',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  offersBtn: {
    background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.4)',
    color: '#f5a623', padding: '7px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  cartBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
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
  cartTotal2: {
    background: 'rgba(0,0,0,0.2)', padding: '2px 8px',
    borderRadius: '6px', fontSize: '13px',
  },
  userBadge: {
    color: '#aaa', fontSize: '13px',
    background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px',
  },
  logoutBtn: { color: '#e74c3c', cursor: 'pointer', fontSize: '18px', padding: '5px' },
  successBanner: {
    background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
    color: 'white', padding: '14px', textAlign: 'center',
    fontSize: '14px', fontWeight: '600', flexShrink: 0,
  },

  // MAIN
  main: { flex: 1, background: '#f5f5f5', overflow: 'auto' },

  // HERO
  heroBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '40px 50px', gap: '30px',
  },
  heroContent: { flex: 1, color: 'white' },
  heroTitle: { fontSize: '36px', fontWeight: '800', margin: '0 0 10px', lineHeight: 1.2 },
  heroAccent: { color: '#f5a623' },
  heroSubtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' },
  heroBtn: {
    background: '#f5a623', color: '#1a1a2e', border: 'none',
    padding: '12px 24px', borderRadius: '50px', fontSize: '14px',
    fontWeight: '700', cursor: 'pointer',
  },
  heroImage: { width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },

  // SECTION
  sectionHeader: { padding: '25px 30px 10px' },
  sectionTitle: { fontSize: '24px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  sectionSub: { color: '#888', margin: '4px 0 0', fontSize: '14px' },

  // CATEGORY FILTER
  categoryFilter: {
    display: 'flex', gap: '10px', padding: '10px 30px 20px', flexWrap: 'wrap',
  },
  catBtn: {
    padding: '9px 18px', border: '2px solid #e0e0e0',
    borderRadius: '25px', cursor: 'pointer', fontSize: '13px',
    fontWeight: '600', transition: 'all 0.2s', background: 'white',
  },

  // MENU GRID
  menuGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', padding: '0 30px 30px',
  },
  menuCard: {
    background: 'white', borderRadius: '16px', overflow: 'hidden',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'default',
  },
  cardImageWrapper: { position: 'relative', height: '190px', overflow: 'hidden' },
  cardImage: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  catTag: {
    position: 'absolute', top: '10px', left: '10px',
    padding: '4px 10px', borderRadius: '20px', color: 'white',
    fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
  },
  inCartBadge: {
    position: 'absolute', bottom: '10px', right: '10px',
    background: '#2ecc71', color: 'white', padding: '4px 10px',
    borderRadius: '20px', fontSize: '11px', fontWeight: '700',
  },
  cardBody: { padding: '15px' },
  itemName: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 5px' },
  itemVariant: { fontSize: '12px', color: '#888', margin: '0 0 8px' },
  itemMeta: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  spiceTag: { fontSize: '11px', color: '#555' },
  stars: { display: 'flex', gap: '2px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: '20px', fontWeight: '800', color: '#2ecc71' },
  addBtn: {
    border: 'none', color: 'white', padding: '8px 14px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    fontWeight: '700', transition: 'background 0.2s',
  },

  // ORDERS
  ordersGrid: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 30px 30px' },
  orderCard: {
    background: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px',
  },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  statusBadge: {
    padding: '6px 14px', borderRadius: '20px',
    color: 'white', fontSize: '13px', fontWeight: '600',
  },
  orderMeta: {
    display: 'flex', gap: '20px', fontSize: '14px',
    color: '#555', marginBottom: '8px',
  },
  custInfo: { fontSize: '13px', color: '#3498db', fontWeight: '600', marginBottom: '5px' },
  notesInfo: {
    fontSize: '12px', color: '#888', fontStyle: 'italic',
    marginBottom: '10px', padding: '6px 10px',
    background: '#f8f9fa', borderRadius: '6px',
  },
  progressWrapper: {
    display: 'flex', alignItems: 'flex-start',
    marginTop: '15px', position: 'relative',
  },
  progressStep: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', flex: 1, position: 'relative',
  },
  progressCircle: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '12px', fontWeight: '700',
    marginBottom: '6px', transition: 'all 0.3s', zIndex: 1,
  },
  progressLine: {
    position: 'absolute', top: '14px', left: '55%', right: '-55%',
    height: '3px', zIndex: 0,
  },
  progressLabel: { fontSize: '10px', textAlign: 'center' },
  emptyState: {
    textAlign: 'center', padding: '60px', background: 'white',
    borderRadius: '16px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
  },
  browseBtn: {
    background: '#f5a623', color: 'white', border: 'none',
    padding: '12px 28px', borderRadius: '50px',
    cursor: 'pointer', fontWeight: '700', fontSize: '14px',
  },

  // CART MODAL
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  cartModal: {
    background: 'white', borderRadius: '20px', padding: '28px',
    width: '540px', maxHeight: '88vh', overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  cartHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  cartTitle: { fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  cartSub: { color: '#888', margin: '3px 0 0', fontSize: '13px' },
  closeBtn: {
    background: '#f0f2f5', border: 'none', padding: '8px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '16px',
  },
  orderDetails: {
    background: '#f8f9fa', borderRadius: '12px',
    padding: '15px', marginBottom: '18px',
  },
  detailRow: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
  },
  detailLabel: {
    fontSize: '13px', fontWeight: '600', color: '#555',
    minWidth: '80px',
  },
  detailInput: {
    flex: 1, padding: '8px 10px', border: '1.5px solid #e0e0e0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: 'white',
  },
  emptyCart: { textAlign: 'center', padding: '30px', color: '#888' },
  cartItemsList: { marginBottom: '15px' },
  cartItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 0', borderBottom: '1px solid #f0f0f0',
  },
  cartItemImg: {
    width: '48px', height: '40px', objectFit: 'cover', borderRadius: '8px',
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e' },
  cartItemPrice: { fontSize: '12px', color: '#888', marginTop: '2px' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '28px', height: '28px', border: '1.5px solid #e0e0e0',
    borderRadius: '6px', cursor: 'pointer', background: 'white',
    fontWeight: '700', fontSize: '16px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontSize: '15px', fontWeight: '700', minWidth: '20px', textAlign: 'center' },
  itemTotal: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', minWidth: '55px', textAlign: 'right' },
  cartSummary: { padding: '12px 0' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#555', marginBottom: '6px',
  },
  summaryDivider: { height: '1px', background: '#e0e0e0', margin: '10px 0' },
  placeOrderBtn: {
    width: '100%', padding: '15px', background: '#f5a623',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginTop: '10px',
  },
  cartNote: {
    textAlign: 'center', fontSize: '11px', color: '#aaa', marginTop: '8px',
  },
};

export default CustomerDashboard;