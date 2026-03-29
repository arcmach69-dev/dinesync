import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import KitchenDashboard from './pages/KitchenDashboard';
import TableManagement from './pages/TableManagement';
import InventoryManagement from './pages/InventoryManagement';
import SalesManagement from './pages/SalesManagement';
import WaiterDashboard from './pages/WaiterDashboard';
import SalaryManagement from './pages/SalaryManagement';
import CustomerDashboard from './pages/CustomerDashboard';
import Invoice from './pages/Invoice';
import DiscountManagement from './pages/DiscountManagement';
import PaymentManagement from './pages/PaymentManagement';
import NotificationCenter from './pages/NotificationCenter';
import AttendanceManagement from './pages/AttendanceManagement';
import StaffManagement from './pages/StaffManagement';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/manager" replace />;
    if (user.role === 'WAITER') return <Navigate to="/waiter" replace />;
    if (user.role === 'KITCHEN_STAFF') return <Navigate to="/kitchen" replace />;
    if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          <Route path="/manager" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <ManagerDashboard />
            </RoleRoute>
          } />
          <Route path="/menu" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <MenuManagement />
            </RoleRoute>
          } />
          <Route path="/orders" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER','WAITER']}>
              <OrderManagement />
            </RoleRoute>
          } />
          <Route path="/kitchen" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER','KITCHEN_STAFF']}>
              <KitchenDashboard />
            </RoleRoute>
          } />
          <Route path="/tables" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER','WAITER']}>
              <TableManagement />
            </RoleRoute>
          } />
          <Route path="/inventory" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <InventoryManagement />
            </RoleRoute>
          } />
          <Route path="/sales" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <SalesManagement />
            </RoleRoute>
          } />
          <Route path="/waiter" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER','WAITER']}>
              <WaiterDashboard />
            </RoleRoute>
          } />
          <Route path="/salary" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <SalaryManagement />
            </RoleRoute>
          } />
          <Route path="/customer" element={
            <RoleRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </RoleRoute>
          } />
          <Route path="/invoice/:orderId" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER','WAITER']}>
              <Invoice />
            </RoleRoute>
          } />
          <Route path="/discounts" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <DiscountManagement />
            </RoleRoute>
          } />
          <Route path="/payments" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <PaymentManagement />
            </RoleRoute>
          } />
          <Route path="/notifications" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <NotificationCenter />
            </RoleRoute>
          } />
          <Route path="/attendance" element={
            <RoleRoute allowedRoles={['ADMIN','MANAGER']}>
              <AttendanceManagement />
            </RoleRoute>
          } />
          <Route path="/staff" element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <StaffManagement />
            </RoleRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;