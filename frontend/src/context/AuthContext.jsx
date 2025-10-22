import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { onUserChange } from '../services/cart.js';




// --------- REVISION EN PROCESO -------------//





const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);


//FUNCION SIN REVISAR
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);





  //USEEFECT CHECKEADO
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

  if (r === 'super-admin' || r === 'superadmin') {
    return wants.includes('super-admin') || wants.includes('superadmin') || wants.includes('admin') || wants.includes('user');
  }
  if (r === 'admin') {
    return wants.includes('admin') || wants.includes('user');
  }
  return wants.includes('user') || wants.length === 0;
};







//funcion CHECKEADA
  const login = async (email, password) => {
    //guardamos en u lo devuelto en la ruta login metodo post
    //const u contiene el ojbeto con usuario y su token (que esta en el body), y el metodo
    //la api /login viene de auth.routes.js en el backend
    const u = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    //seteamos el token del usuario
    localStorage.setItem('token', u.token);
    //u.user tiene todos los datos del user (sin el token)
    setUser(u.user);
    //cambia el carrito
    onUserChange(u.user.id );
    return u.user;
  };



  //FUNCION CHECKEADA
  //register toma payload de parametro, que sera mail, name y password, proveniente de Register.jsx
  const register = async (payload) => {
    //guardamos en la constante "u" el json que devuelve la ruta /register y lo guardamos en un objeto
    const u = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    //seteamos en localStorage el token del usuario
    localStorage.setItem('token', u.token);
    //en setUser seteamos todos los datos del usuario
    setUser(u.user);
    //onUserChange cambiamos el carrito del usuario
    onUserChange(u.user.id);     
    return u.user;
  };






  //FUNCION CHECKEADA
  const logout = () => {
    //remueve el token que hay en localstorage
    localStorage.removeItem('token');
    //setea el user a null, es decir no hay user
    setUser(null);
    //setea el carrito a null
    onUserChange(null);                   
  };

  return (
    //todo lo que envuelva el provider tendran estas funciones disponibles (provider esta en app)
  <AuthCtx.Provider value={{ user, login, register, logout, hasRole }}>
    {children}
  </AuthCtx.Provider>
);
}