import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { readCart } from '../services/cart.js'

export default function Navbar(){
  const { user, logout, hasRole } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  // etiqueta segura: name → email user → 'user'
  const label = user ? (user.name || (user.email?.split('@')[0]) || 'user') : null

  useEffect(()=>{
    const load = ()=> {
      const cart = readCart()
      setCartCount(cart.reduce((a,i)=> a + Number(i.qty||0), 0))
    }
    load()
    const id = setInterval(load, 500)
    return ()=> clearInterval(id)
  },[])

  return (
    <nav className="nav">
      <Link to="/" className="brand">GymShop</Link>
      <Link to="/carrito">Carrito ({cartCount})</Link>
      {user && <Link to="/mis-ordenes">Mis Órdenes</Link>}

      {typeof hasRole === 'function' && hasRole('admin','super-admin') && (
        <>
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/ordenes">Órdenes</Link>
        </>
      )}
      {typeof hasRole === 'function' && hasRole('super-admin') && (
        <Link to="/admin/usuarios">Usuarios</Link>
      )}

      <div style={{ marginLeft: 'auto' }} className="row">
        {user ? (
          <>
            <span className="badge">{label} · {user.role}</span>
            <button className="btn" onClick={()=>{ logout(); navigate('/'); }}>Salir</button>
          </>
        ) : (
          <>
            <Link className="btn" to="/login">Login</Link>
            <Link className="btn" to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  )
}