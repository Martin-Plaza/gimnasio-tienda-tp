import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { readCart } from '../services/cart.js';

export default function Navbar(){
  const { user, logout, hasRole } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const label = user ? (user.name || (user.email?.split('@')[0]) || 'user') : null;

  useEffect(() => {
    const load = () => {
      const cart = readCart();
      setCartCount(cart.reduce((a, i) => a + Number(i.qty || 0), 0));
    };
    load();
    const id = setInterval(load, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">GymShop</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/mis-ordenes">Mis Órdenes</NavLink>
              </li>
            )}
            {typeof hasRole === 'function' && hasRole('admin','super-admin') && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/productos">Admin · Productos</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/ordenes">Admin · Órdenes</NavLink></li>
              </>
            )}
            {typeof hasRole === 'function' && hasRole('super-admin') && (
              <li className="nav-item"><NavLink className="nav-link" to="/admin/usuarios">Admin · Usuarios</NavLink></li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item me-2">
              <NavLink className="btn btn-outline-dark position-relative" to="/carrito">
                Carrito
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-warning" style={{ color: '#111' }}>
                  {cartCount}
                </span>
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item me-2">
                  <span className="badge text-bg-warning" style={{ color: '#111' }}>{label} · {user.role}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-dark" onClick={() => { logout(); navigate('/'); }}>
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2"><NavLink className="btn btn-outline-dark" to="/login">Login</NavLink></li>
                <li className="nav-item"><NavLink className="btn btn-dark" to="/register">Registro</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}