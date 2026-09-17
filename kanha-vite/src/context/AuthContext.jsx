import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kanha_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('kanha_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getCurrentUser();
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('kanha_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Failed to fetch user session:', err.message);
      setUser(null);
      localStorage.removeItem('kanha_user');
      localStorage.removeItem('kanha_access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleLogoutEvent = () => {
      setUser(null);
      localStorage.removeItem('kanha_user');
      localStorage.removeItem('kanha_access_token');
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success && res.data?.data) {
      const authData = res.data.data;
      localStorage.setItem('kanha_access_token', authData.accessToken);
      const userProfile = {
        id: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      };
      setUser(userProfile);
      localStorage.setItem('kanha_user', JSON.stringify(userProfile));
      return authData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data?.success && res.data?.data) {
      const authData = res.data.data;
      localStorage.setItem('kanha_access_token', authData.accessToken);
      const userProfile = {
        id: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      };
      setUser(userProfile);
      localStorage.setItem('kanha_user', JSON.stringify(userProfile));
      return authData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('kanha_user');
      localStorage.removeItem('kanha_access_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
