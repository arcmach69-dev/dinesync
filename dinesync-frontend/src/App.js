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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute><ManagerDashboard /></ProtectedRoute>
          } />
          <Route path="/menu" element={
            <ProtectedRoute><MenuManagement /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrderManagement /></ProtectedRoute>
          } />
          <Route path="/kitchen" element={
            <ProtectedRoute><KitchenDashboard /></ProtectedRoute>
          } />
          <Route path="/tables" element={
            <ProtectedRoute><TableManagement /></ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute><InventoryManagement /></ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute><SalesManagement /></ProtectedRoute>
          } />
          <Route path="/waiter" element={
            <ProtectedRoute><WaiterDashboard /></ProtectedRoute>
          } />
          <Route path="/salary" element={
            <ProtectedRoute><SalaryManagement /></ProtectedRoute>
          } />
          <Route path="/customer" element={
            <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/invoice/:orderId" element={
            <ProtectedRoute><Invoice /></ProtectedRoute>
          } />
          <Route path="/discounts" element={
            <ProtectedRoute><DiscountManagement /></ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute><PaymentManagement /></ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;