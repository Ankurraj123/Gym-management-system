import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tf_token') || localStorage.getItem('tf_admin_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('tf_token');
          localStorage.removeItem('tf_admin_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role = 'member', remember = false) => {
    const endpoint = role === 'admin' ? '/admin/login' : '/member/login';
    const res = await api.post(endpoint, { email, password, role });
    const { token, user: userData, admin: adminData } = res.data;
    const finalUser = userData || adminData || { email, role };
    if (!finalUser.role) finalUser.role = role;

    localStorage.setItem('tf_token', token);
    localStorage.setItem('tf_admin_token', token);

    if (remember) {
      localStorage.setItem('tf_remember_email', email);
      localStorage.setItem('tf_remember_role', role);
    } else {
      localStorage.removeItem('tf_remember_email');
      localStorage.removeItem('tf_remember_role');
    }

    setUser(finalUser);
    return finalUser;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/member/member-register', { name, email, password, phone });
    const { token, user: userData } = res.data;
    localStorage.setItem('tf_token', token);
    localStorage.setItem('tf_admin_token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_admin_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user || res.data.admin);
    return res.data;
  };

  const changePassword = async (passwords) => {
    const res = await api.put('/auth/change-password', passwords);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin: user, // backward compatibility
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
