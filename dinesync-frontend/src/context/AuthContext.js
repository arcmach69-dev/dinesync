import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const email = sessionStorage.getItem('email');
    return token ? { token, role, email } : null;
  });

  const login = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('email', data.email);
    setUser(data);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);