import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoleNavigation } from '../context/useRoleNavigation';
import api from '../services/api';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userId: '', fullName: '', role: 'WAITER',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00', checkOutTime: '17:00',
    status: 'PRESENT', leaveType: 'NONE', remarks: '',
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useRoleNavigation();

  useEffect(() => {
    fetchAllStaff();
    fetchAttendanceByDate(selectedDate);
  }, []);

  const fetchAllStaff = async () => {
    try {
      const res = await api.get('/api/users');
      // Only staff — no admin, no customer
      setAllStaff(res.data.filter(u =>
        u.role !== 'ADMIN' && u.role !== 'CUSTOMER'
      ));
    } catch (err) { console.error(err); }
  };

  const fetchAttendanceByDate = async (date) => {
    try {
      const res = await api.get(`/api/attendance/date/${date}`);
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllAttendance = async () => {
    try {
      const res = await api.get('/api/attendance');
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  // Auto-generate today's attendance for all staff
  const autoGenerateAttendance = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const existing = await api.get(`/api/attendance/date/${today}`);
      const existingUserIds = existing.data.map(a => a.userId);

      // Create records for staff who don't have one yet
      const missing = allStaff.filter(
        s => !existingUserIds.includes(s.userId)
      );

      for (const staff of missing) {
        await api.post('/api/attendance', {
          userId: staff.userId,
          fullName: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          date: today,
          checkInTime: '09:00',
          checkOutTime: null,
          status: 'PRESENT',
          leaveType: 'NONE',
          remarks: 'Auto-generated',
        });
      }

      setSelectedDate(today);
      fetchAttendanceByDate(today);
      alert(`✅ Generated attendance for ${missing.length} staff members!`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate attendance');
    } finally {
      setLoading(false);
    }
  };

  // Quick update status inline
  const quickUpdateStatus = async (record, newStatus) => {
    try {
      await api.put(`/api/attendance/${record.attendanceId}`, {
        ...record, status: newStatus,
        leaveType: newStatus === 'PRESENT' ? 'NONE' : record.leaveType,
      });
      fetchAttendanceByDate(selectedDate);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/attendance/${editItem.attendanceId}`, form);
      } else {
        await api.post('/api/attendance', form);
      }
      setShowForm(false);
      setEditItem(null);
      resetForm();
      fetchAttendanceByDate(selectedDate);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setForm({
      userId: '', fullName: '', role: 'WAITER',
      date: selectedDate,
      checkInTime: '09:00', checkOutTime: '17:00',
      status: 'PRESENT', leaveType: 'NONE', remarks: '',
    });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      checkInTime: item.checkInTime || '09:00',
      checkOutTime: item.checkOutTime || '17:00',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await api.delete(`/api/attendance/${id}`);
      fetchAttendanceByDate(selectedDate);
    }
  };

  // Calculate hours worked
  const calcHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMins < 0) return '—';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const statusColors = {
    PRESENT: '#2ecc71', ABSENT: '#e74c3c', HALFDAY: '#f5a623',
  };
  const roleColors = {
    MANAGER: '#3498db', KITCHEN_STAFF: '#e74c3c',
    WAITER: '#2ecc71',
  };

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const halfdayCount = attendance.filter(a => a.status === 'HALFDAY').length;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span>🍽️</span>
          <span style={styles.logoText}>DineSync</span>
        </div>
        <div style={styles.backBtn} onClick={() => goToDashboard()}>
          <FaArrowLeft />
          <span style={{marginLeft:'8px'}}>Back to Dashboard</span>
        </div>
        <div style={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          🚪 Logout
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📅 Attendance Management</h1>
            <p style={styles.subtitle}>
              {attendance.length} records for {selectedDate}
            </p>
          </div>
          <div style={styles.headerBtns}>
            <button style={styles.autoBtn}
              onClick={autoGenerateAttendance}
              disabled={loading}>
              <FaSync /> {loading ? 'Generating...' : 'Auto-Generate Today'}
            </button>
            <button style={styles.addBtn}
              onClick={() => {
                setEditItem(null);
                resetForm();
                setShowForm(true);
              }}>
              <FaPlus /> Add Manual
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <div style={{...styles.statValue, color:'#2ecc71'}}>
                {presentCount}
              </div>
              <div style={styles.statLabel}>Present</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div>
              <div style={{...styles.statValue, color:'#e74c3c'}}>
                {absentCount}
              </div>
              <div style={styles.statLabel}>Absent</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏰</div>
            <div>
              <div style={{...styles.statValue, color:'#f5a623'}}>
                {halfdayCount}
              </div>
              <div style={styles.statLabel}>Half Day</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <div style={{...styles.statValue, color:'#3498db'}}>
                {allStaff.length}
              </div>
              <div style={styles.statLabel}>Total Staff</div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div style={styles.filterBox}>
          <label style={styles.filterLabel}>📅 Filter by Date:</label>
          <input style={styles.dateInput} type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              fetchAttendanceByDate(e.target.value);
            }} />
          <button style={styles.allBtn} onClick={fetchAllAttendance}>
            Show All Records
          </button>
          <button style={styles.todayBtn}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(today);
              fetchAttendanceByDate(today);
            }}>
            Today
          </button>
        </div>

        {/* Staff Quick Status Cards */}
        {attendance.length > 0 && (
          <div style={styles.quickSection}>
            <h3 style={styles.quickTitle}>
              Quick Status Update — Click to change
            </h3>
            <div style={styles.quickGrid}>
              {attendance.map(record => (
                <div key={record.attendanceId} style={{
                  ...styles.quickCard,
                  borderTop: `4px solid ${statusColors[record.status]}`,
                  background: record.status === 'ABSENT'
                    ? '#fff5f5' : 'white',
                }}>
                  <div style={styles.quickName}>
                    {record.fullName}
                  </div>
                  <div style={{
                    ...styles.quickRole,
                    color: roleColors[record.role] || '#888'
                  }}>
                    {record.role}
                  </div>
                  <div style={styles.quickTime}>
                    {record.checkInTime && `🕘 In: ${record.checkInTime}`}
                    {record.checkOutTime && ` | Out: ${record.checkOutTime}`}
                  </div>
                  <div style={styles.quickHours}>
                    ⏱️ {calcHours(record.checkInTime, record.checkOutTime)}
                  </div>
                  <div style={styles.quickBtns}>
                    {['PRESENT','HALFDAY','ABSENT'].map(status => (
                      <button key={status}
                        style={{
                          ...styles.statusBtn,
                          background: record.status === status
                            ? statusColors[status] : '#f0f2f5',
                          color: record.status === status ? 'white' : '#555',
                        }}
                        onClick={() => quickUpdateStatus(record, status)}>
                        {status === 'PRESENT' ? '✅' :
                         status === 'HALFDAY' ? '⏰' : '❌'}
                        {' '}{status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>
                {editItem ? '✏️ Edit Attendance' : '➕ Add Attendance'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input}
                      value={form.fullName}
                      onChange={e => setForm({...form, fullName: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>User ID</label>
                    <input style={styles.input} type="number"
                      value={form.userId}
                      onChange={e => setForm({...form, userId: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select style={styles.input} value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}>
                      {['MANAGER','KITCHEN_STAFF','WAITER'].map(r =>
                        <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date</label>
                    <input style={styles.input} type="date"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                      required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Check In Time</label>
                    <input style={styles.input} type="time"
                      value={form.checkInTime}
                      onChange={e => setForm({...form, checkInTime: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Check Out Time</label>
                    <input style={styles.input} type="time"
                      value={form.checkOutTime}
                      onChange={e => setForm({...form, checkOutTime: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}>
                      {['PRESENT','ABSENT','HALFDAY'].map(s =>
                        <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Leave Type</label>
                    <select style={styles.input} value={form.leaveType}
                      onChange={e => setForm({...form, leaveType: e.target.value})}>
                      {['NONE','SICK','CASUAL','NOSHOW'].map(l =>
                        <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{...styles.formGroup, gridColumn:'1/-1'}}>
                    <label style={styles.label}>Remarks</label>
                    <input style={styles.input}
                      value={form.remarks}
                      placeholder="Optional notes..."
                      onChange={e => setForm({...form, remarks: e.target.value})} />
                  </div>
                </div>
                <div style={styles.modalBtns}>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => {
                      setShowForm(false);
                      setEditItem(null);
                      resetForm();
                    }}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>
                    {editItem ? 'Update' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Table */}
        {attendance.length > 0 && (
          <div style={{...styles.tableBox, marginTop:'25px'}}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check In</th>
                  <th style={styles.th}>Check Out</th>
                  <th style={styles.th}>Hours</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record.attendanceId} style={{
                    ...styles.tableRow,
                    background: record.status === 'ABSENT'
                      ? '#fff5f5' : 'white',
                  }}>
                    <td style={styles.td}>
                      <strong>{record.fullName}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: roleColors[record.role] || '#888'
                      }}>
                        {record.role}
                      </span>
                    </td>
                    <td style={styles.td}>{record.date}</td>
                    <td style={styles.td}>{record.checkInTime || '—'}</td>
                    <td style={styles.td}>{record.checkOutTime || '—'}</td>
                    <td style={styles.td}>
                      <strong style={{color:'#3498db'}}>
                        {calcHours(record.checkInTime, record.checkOutTime)}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statusColors[record.status]
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtnSm}
                        onClick={() => handleEdit(record)}>
                        <FaEdit />
                      </button>
                      <button style={styles.deleteBtnSm}
                        onClick={() => handleDelete(record.attendanceId)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {attendance.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={{fontSize:'48px'}}>📅</div>
            <h3 style={{color:'#1a1a2e', margin:'10px 0 5px'}}>
              No attendance records for {selectedDate}
            </h3>
            <p style={{color:'#888', marginBottom:'20px'}}>
              Click "Auto-Generate Today" to create records for all staff
            </p>
            <button style={styles.autoBtn} onClick={autoGenerateAttendance}>
              <FaSync /> Auto-Generate Today's Attendance
            </button>
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
  backBtn: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    cursor: 'pointer', color: '#aaa', fontSize: '14px', marginTop: '10px',
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
  headerBtns: { display: 'flex', gap: '10px' },
  autoBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#3498db', color: 'white', border: 'none',
    padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f5a623', color: 'white', border: 'none',
    padding: '12px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
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
  statIcon: { fontSize: '32px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  statLabel: { color: '#888', fontSize: '13px' },
  filterBox: {
    display: 'flex', alignItems: 'center', gap: '15px',
    background: 'white', padding: '15px 20px', borderRadius: '12px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  filterLabel: { fontSize: '14px', fontWeight: '600', color: '#333' },
  dateInput: {
    padding: '8px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  allBtn: {
    background: '#9b59b6', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '13px',
  },
  todayBtn: {
    background: '#2ecc71', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '13px',
  },
  quickSection: {
    background: 'white', borderRadius: '12px', padding: '20px',
    marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  quickTitle: {
    fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '15px',
  },
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px',
  },
  quickCard: {
    borderRadius: '10px', padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  quickName: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '3px' },
  quickRole: { fontSize: '11px', fontWeight: '600', marginBottom: '6px' },
  quickTime: { fontSize: '11px', color: '#888', marginBottom: '4px' },
  quickHours: { fontSize: '12px', color: '#3498db', fontWeight: '600', marginBottom: '10px' },
  quickBtns: { display: 'flex', gap: '5px' },
  statusBtn: {
    flex: 1, padding: '5px 4px', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '10px', fontWeight: '600',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: '16px', padding: '30px',
    width: '620px', maxHeight: '85vh', overflow: 'auto',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' },
  input: {
    padding: '10px 12px', border: '2px solid #e0e0e0',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
  },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '10px 20px', background: '#f0f2f5', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 20px', background: '#f5a623', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
  },
  tableBox: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8f9fa' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' },
  tableRow: { borderTop: '1px solid #f0f0f0' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#333' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600',
  },
  editBtnSm: {
    background: '#3498db', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px',
  },
  deleteBtnSm: {
    background: '#e74c3c', color: 'white', border: 'none',
    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
  },
  emptyBox: {
    background: 'white', borderRadius: '12px', padding: '60px',
    textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
};

export default AttendanceManagement;