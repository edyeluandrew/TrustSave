import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe(token).then(userData => {
        setUser(userData);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
const login = async (phone, password) => {
  try {
    const response = await authAPI.login(phone, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response);
      return response; // Make sure this returns
    }
  } catch (error) {
    throw error;
  }
};

  // Register function
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response);
      return response;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};