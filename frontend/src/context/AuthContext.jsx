import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // cargar usuario si hay token
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return;
    api('/auth/whoami')
      .then(u => setUser(u))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);

  const login = async ({ email, password }) => {
    const { token, user } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async ({ name, email, password }) => {
    const { token, user } = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}