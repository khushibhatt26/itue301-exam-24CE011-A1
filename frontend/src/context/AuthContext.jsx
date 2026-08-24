import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(() => {
    try {
      const saved = localStorage.getItem('techsolutions_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('techsolutions_token') || null;
  });

  const role = employee ? employee.role : null;

  const login = (userData, authToken) => {
    setEmployee(userData);
    setToken(authToken);
    try {
      localStorage.setItem('techsolutions_user', JSON.stringify(userData));
      localStorage.setItem('techsolutions_token', authToken);
    } catch (e) {
      console.error('Storage error', e);
    }
  };

  const logout = () => {
    setEmployee(null);
    setToken(null);
    try {
      localStorage.removeItem('techsolutions_user');
      localStorage.removeItem('techsolutions_token');
    } catch (e) {
      console.error('Storage error', e);
    }
  };

  // Helper to update employee details (such as updated leaveBalance)
  const updateEmployee = (updatedData) => {
    setEmployee((prev) => {
      const next = { ...prev, ...updatedData };
      try {
        localStorage.setItem('techsolutions_user', JSON.stringify(next));
      } catch (e) {
        console.error('Storage error', e);
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ employee, token, role, login, logout, updateEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
