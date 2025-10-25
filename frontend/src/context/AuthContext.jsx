import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { onUserChange } from '../services/cart.js';




// --------- MODULO CHECKEADO -------------//





const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);


//FUNCION CHECKEADA
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







  //FUNCION CHECKEADA
  //hasRole recibe un parametro ...roles, que es parametro rest
  //...roles es un arreglo con los parametros que le enviamos
  const hasRole = (...roles) => {
    //si no hay usuario en el estado retorna falso
  if (!user) return false;
  //en r guardamos el rol del usuario actual
  const r = String(user.role);

  //si el rol igual a super-admin puede cumplir con cualquiera de los 3 roles
  if (r === 'super-admin') {
    return roles.includes('super-admin')|| roles.includes('admin') || roles.includes('user');
  }
  //si el rol es igual a admin puede cumplir con admin y user
  if (r === 'admin') {
    return roles.includes('admin') || roles.includes('user');
  }
  //si el rol es user solo puede cumplir ese rol
  return roles.includes('user') || roles.length === 0;
};







//funcion CHECKEADA
  const login = async (email, password) => {
    localStorage.removeItem('token');
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