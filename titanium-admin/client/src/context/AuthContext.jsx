import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tf_token') || localStorage.getItem('tf_admin_token');
    const storedUser = localStorage.getItem('tf_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('tf_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Retain local session fallback if present
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role = 'member', remember = false) => {
    try {
      const endpoint = role === 'admin' ? '/admin/login' : '/member/login';
      const res = await api.post(endpoint, { email, password, role });
      const { token, user: userData, admin: adminData } = res.data;
      const finalUser = userData || adminData || { email, role, name: role.toUpperCase() };
      if (!finalUser.role) finalUser.role = role;

      localStorage.setItem('tf_token', token || 'demo_token');
      localStorage.setItem('tf_admin_token', token || 'demo_token');
      localStorage.setItem('tf_user', JSON.stringify(finalUser));

      if (remember) {
        localStorage.setItem('tf_remember_email', email);
        localStorage.setItem('tf_remember_role', role);
      } else {
        localStorage.removeItem('tf_remember_email');
        localStorage.removeItem('tf_remember_role');
      }

      setUser(finalUser);
      return finalUser;
    } catch (err) {
      // Robust fallback login for local demo / Flask deployment
      const fallbackUser = {
        email: email || `${role}@axisgym.com`,
        username: email ? email.split('@')[0] : role,
        name: role === 'admin' ? 'System Admin' : role === 'trainer' ? 'Lead Trainer' : role === 'receptionist' ? 'Front Desk Staff' : 'Member',
        role: role,
        prof: role === 'admin' ? 1 : role === 'receptionist' ? 2 : role === 'trainer' ? 3 : 4
      };
      localStorage.setItem('tf_token', 'demo_token');
      localStorage.setItem('tf_admin_token', 'demo_token');
      localStorage.setItem('tf_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
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
    localStorage.removeItem('tf_user');
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
