import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Invoice = () => {
  const { orderId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetchOrder();
    fetchPayment();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/api/payments/order/${orderId}`);
      if (res.data.length > 0) {
        setPayment(res.data[0]);
        setPaid(res.data[0].paymentStatus === 'PAID');
      }
    } catch (err) { console.error(err); }
  };

  const handlePayment = async () => {
    try {
      await api.post('/api/payments', {
        orderId: parseInt(orderId),
        amount: order.totalAmount,
        paymentMethod,
        paymentStatus: 'PAID',
        paidAt: new Date().toISOString(),
      });
      setPaid(true);
      setShowPaymentForm(false);
      fetchPayment();
    } catch (err) { console.error(err); }
  };

  const handlePrint = () => {
    window.print();
  };

  const tax = order ? (parseFloat(order.totalAmount) * 0.08).toFixed(2) : 0;
  const total = order
    ? (parseFloat(order.totalAmount) + parseFloat(tax)).toFixed(2)
    : 0;

  const now = new Date();

  if (!order) return (
    <div style={styles.loading}>Loading invoice...</div>
  );

  return (
    <div style={styles.container}>
      {/* Action Buttons - hidden when printing */}
      <div style={styles.actionBar} className="no-print">
        <button style={styles.backBtn}
          onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.actionBtns}>
          {!paid && (
            <button style={styles.payBtn}
              onClick={() => setShowPaymentForm(true)}>
              💳 Collect Payment
            </button>
          )}
          <button style={styles.printBtn} onClick={handlePrint}>
            🖨️ Print / Download PDF
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h2 style={styles.modalTitle}>Collect Payment</h2>
            <div style={styles.paymentAmount}>
              Total Amount: <strong>${total}</strong>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method</label>
              <div style={styles.paymentMethods}>
                {['CASH','CARD','UPI','APPLE_PAY'].map(method => (
                  <div key={method}
                    style={{
                      ...styles.methodCard,
                      border: paymentMethod === method
                        ? '2px solid #f5a623'
                        : '2px solid #e0e0e0',
                      background: paymentMethod === method
                        ? '#fff8ee' : 'white',
                    }}
                    onClick={() => setPaymentMethod(method)}>
                    <div style={styles.methodIcon}>
                      {method === 'CASH' && '💵'}
                      {method === 'CARD' && '💳'}
                      {method === 'UPI' && '📱'}
                      {method === 'APPLE_PAY' && '🍎'}
                    </div>
                    <div style={styles.methodLabel}>{method}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn}
                onClick={() => setShowPaymentForm(false)}>
                Cancel
              </button>
              <button style={styles.confirmPayBtn}
                onClick={handlePayment}>
                ✅ Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice */}
      <div style={styles.invoice} ref={printRef}>
        {/* Header */}
        <div style={styles.invoiceHeader}>
          <div style={styles.restaurantInfo}>
            <h1 style={styles.restaurantName}>🍽️ DineSync</h1>
            <p style={styles.restaurantAddress}>
              123 Restaurant Street, Food City
            </p>
            <p style={styles.restaurantContact}>
              📞 +1 (555) 123-4567 | ✉️ info@dinesync.com
            </p>
          </div>
          <div style={styles.invoiceMeta}>
            <div style={styles.invoiceTitle}>INVOICE</div>
            <div style={styles.invoiceNumber}>
              #{String(order.orderId).padStart(6, '0')}
            </div>
            <div style={styles.invoiceDate}>
              {now.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
            <div style={styles.invoiceTime}>
              {now.toLocaleTimeString('en-US')}
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Order Info */}
        <div style={styles.orderInfo}>
          <div style={styles.orderInfoItem}>
            <span style={styles.infoLabel}>Order ID:</span>
            <span style={styles.infoValue}>#{order.orderId}</span>
          </div>
          <div style={styles.orderInfoItem}>
            <span style={styles.infoLabel}>Order Type:</span>
            <span style={styles.infoValue}>{order.orderType}</span>
          </div>
          <div style={styles.orderInfoItem}>
            <span style={styles.infoLabel}>Table:</span>
            <span style={styles.infoValue}>
              {order.tableId ? `Table ${order.tableId}` : 'Takeaway'}
            </span>
          </div>
          <div style={styles.orderInfoItem}>
            <span style={styles.infoLabel}>Status:</span>
            <span style={{
              ...styles.infoValue,
              color: order.orderStatus === 'DELIVERED' ? '#2ecc71' : '#f5a623',
              fontWeight: '700',
            }}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Items Table */}
        <table style={styles.itemsTable}>
          <thead>
            <tr style={styles.itemsHead}>
              <th style={styles.itemTh}>Item</th>
              <th style={{...styles.itemTh, textAlign:'center'}}>Qty</th>
              <th style={{...styles.itemTh, textAlign:'right'}}>Price</th>
              <th style={{...styles.itemTh, textAlign:'right'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.itemRow}>
              <td style={styles.itemTd}>Order Items</td>
              <td style={{...styles.itemTd, textAlign:'center'}}>1</td>
              <td style={{...styles.itemTd, textAlign:'right'}}>
                ${parseFloat(order.totalAmount).toFixed(2)}
              </td>
              <td style={{...styles.itemTd, textAlign:'right'}}>
                ${parseFloat(order.totalAmount).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={styles.divider} />

        {/* Totals */}
        <div style={styles.totalsSection}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Subtotal:</span>
            <span style={styles.totalValue}>
              ${parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Tax (8%):</span>
            <span style={styles.totalValue}>${tax}</span>
          </div>
          <div style={styles.divider} />
          <div style={{...styles.totalRow, ...styles.grandTotal}}>
            <span>TOTAL:</span>
            <span>${total}</span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Payment Status */}
        <div style={styles.paymentStatus}>
          {paid ? (
            <div style={styles.paidBadge}>
              ✅ PAID — {payment?.paymentMethod}
            </div>
          ) : (
            <div style={styles.unpaidBadge}>
              ⏳ PAYMENT PENDING
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.invoiceFooter}>
          <p style={styles.footerText}>
            Thank you for dining with us! 🍽️
          </p>
          <p style={styles.footerText}>
            Visit us again at DineSync Restaurant
          </p>
          <p style={{...styles.footerText, fontSize:'11px', color:'#aaa'}}>
            This is a computer generated invoice
          </p>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', padding: '20px', fontFamily: "'Segoe UI', sans-serif" },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#888' },
  actionBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    maxWidth: '800px', margin: '0 auto 20px',
  },
  backBtn: {
    background: 'white', border: '2px solid #e0e0e0', padding: '10px 20px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
  },
  actionBtns: { display: 'flex', gap: '10px' },
  payBtn: {
    background: '#2ecc71', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
  },
  printBtn: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px', width: '450px',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  paymentAmount: {
    fontSize: '18px', color: '#555', marginBottom: '20px',
    textAlign: 'center',
  },
  formGroup: { marginBottom: '20px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px', display: 'block' },
  paymentMethods: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  methodCard: {
    padding: '15px 10px', borderRadius: '10px', cursor: 'pointer',
    textAlign: 'center', transition: 'all 0.2s',
  },
  methodIcon: { fontSize: '24px', marginBottom: '5px' },
  methodLabel: { fontSize: '12px', fontWeight: '600', color: '#333' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  confirmPayBtn: {
    padding: '10px 20px', background: '#2ecc71', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  invoice: {
    background: 'white', maxWidth: '800px', margin: '0 auto',
    padding: '40px', borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  invoiceHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '25px',
  },
  restaurantName: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 5px' },
  restaurantAddress: { color: '#888', fontSize: '13px', margin: '2px 0' },
  restaurantContact: { color: '#888', fontSize: '13px', margin: '2px 0' },
  invoiceMeta: { textAlign: 'right' },
  invoiceTitle: { fontSize: '28px', fontWeight: '800', color: '#f5a623', letterSpacing: '3px' },
  invoiceNumber: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  invoiceDate: { fontSize: '13px', color: '#888', marginTop: '5px' },
  invoiceTime: { fontSize: '13px', color: '#888' },
  divider: { height: '1px', background: '#e0e0e0', margin: '20px 0' },
  orderInfo: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px',
  },
  orderInfoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  infoLabel: { fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: '14px', color: '#1a1a2e', fontWeight: '600' },
  itemsTable: { width: '100%', borderCollapse: 'collapse' },
  itemsHead: { background: '#f8f9fa' },
  itemTh: {
    padding: '12px 15px', fontSize: '12px', fontWeight: '700',
    color: '#555', textTransform: 'uppercase', textAlign: 'left',
  },
  itemRow: { borderBottom: '1px solid #f0f0f0' },
  itemTd: { padding: '15px', fontSize: '14px', color: '#333' },
  totalsSection: { maxWidth: '300px', marginLeft: 'auto' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '6px 0', fontSize: '14px', color: '#555',
  },
  totalLabel: { color: '#888' },
  totalValue: { fontWeight: '600', color: '#1a1a2e' },
  grandTotal: {
    fontSize: '20px', fontWeight: '800', color: '#1a1a2e',
    marginTop: '5px',
  },
  paymentStatus: { textAlign: 'center', padding: '15px' },
  paidBadge: {
    display: 'inline-block', background: '#e8f8f0', color: '#2ecc71',
    padding: '10px 30px', borderRadius: '25px', fontWeight: '700', fontSize: '16px',
  },
  unpaidBadge: {
    display: 'inline-block', background: '#fff8ee', color: '#f5a623',
    padding: '10px 30px', borderRadius: '25px', fontWeight: '700', fontSize: '16px',
  },
  invoiceFooter: { textAlign: 'center', marginTop: '20px' },
  footerText: { color: '#888', fontSize: '13px', margin: '3px 0' },
};

export default Invoice;