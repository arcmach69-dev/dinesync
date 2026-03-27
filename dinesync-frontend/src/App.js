import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import KitchenDashboard from './pages/KitchenDashboard';
import TableManagement from './pages/TableManagement';
import InventoryManagement from './pages/InventoryManagement';
import SalesManagement from './pages/SalesManagement';

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
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;