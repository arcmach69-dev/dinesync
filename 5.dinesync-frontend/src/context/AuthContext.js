import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const email = sessionStorage.getItem('email');
    const userId = sessionStorage.getItem('userId');
    const attendanceId = sessionStorage.getItem('attendanceId');
    return token ? { token, role, email, userId, attendanceId } : null;
  });

  const login = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('email', data.email);
    sessionStorage.setItem('userId', data.userId || '');
    // No auto attendance here — only manual Check In button
    setUser(data);
  };

  const logout = () => {
    // No auto attendance here — only manual Check Out button
    sessionStorage.clear();
    setUser(null);
  };

  const setAttendanceId = (id) => {
    sessionStorage.setItem('attendanceId', id);
    setUser(prev => ({ ...prev, attendanceId: id }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setAttendanceId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);