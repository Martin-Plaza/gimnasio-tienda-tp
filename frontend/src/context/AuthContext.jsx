import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { onUserChange } from '../services/cart.js';




// --------- REVISION EN PROCESO -------------//





const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // useEfect que evalua si hay token, si no hay siginifica que no hay nadie logeado
  //si hay token hace un AUTOLOGEADO
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return;
    
    //si hay no hay return, es decir que sigue y llama a la api WhoAmI
    //esta api guarda la consulta a la base de datos del usuario encontrado en auth.routes
    api('/auth/whoami')
      .then(u => {
        //guardamos en user lo traido con la API
        setUser(u);
        //onUserChange recibe el id del usuario, onUserChange viene de Cart.js
        onUserChange(u.id);
      })
      .catch(() => {
        //remueve el token que estaba antes
        localStorage.removeItem('token');
        setUser(null);
        onUserChange(null);
      });
  }, []);


  const hasRole = (...roles) => {
  if (!user) return false;
  const r = String(user.role || '').toLowerCase();
  const wants = roles.map(x => String(x).toLowerCase());

  // jerarquía: super-admin ≥ admin ≥ user
  if (r === 'super-admin' || r === 'superadmin') {
    return wants.includes('super-admin') || wants.includes('superadmin') || wants.includes('admin') || wants.includes('user');
  }
  if (r === 'admin') {
    return wants.includes('admin') || wants.includes('user');
  }
  return wants.includes('user') || wants.length === 0;
};

  const login = async (email, password) => {
    const u = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', u.token);
    setUser(u.user);
    onUserChange(u.user?.id || null);     // Set carrito usuario
    return u.user;
  };

  const register = async (payload) => {
    const u = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('token', u.token);
    setUser(u.user);
    onUserChange(u.user?.id || null);     // Set carrito usuario
    return u.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    onUserChange(null);                   // Reset carrito a invitado
  };

  return (
    //todo lo que envuelva el provider tendran estas funciones disponibles (provider esta en app)
  <AuthCtx.Provider value={{ user, login, register, logout, hasRole }}>
    {children}
  </AuthCtx.Provider>
);
}