import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar(){
  const { user, logout, hasRole } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  useEffect(()=>{
    const load = ()=>{
      const cart = JSON.parse(localStorage.getItem('cart')||'[]')
      setCartCount(cart.reduce((a,i)=>a+i.qty,0))
    }
    load()
    const i = setInterval(load, 500)
    return ()=>clearInterval(i)
  },[])

  return (
    <nav className="nav">
      <Link to="/" className="brand">GymShop</Link>
      <Link to="/carrito">Carrito ({cartCount})</Link>
      {user && <Link to="/mis-ordenes">Mis Órdenes</Link>}
      {hasRole && hasRole('admin','super-admin') && (
        <>
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/ordenes">Órdenes</Link>
        </>
      )}
      {hasRole && hasRole('super-admin') && <Link to="/admin/usuarios">Usuarios</Link>}
      <div style={{marginLeft:'auto'}} className="row">
        {user
          ? (<>
              <span className="badge">{user.name} · {user.role}</span>
              <button className="btn" onClick={()=>{ logout(); navigate('/')}}>Salir</button>
            </>)
          : (<>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn" to="/register">Registro</Link>
            </>)
        }
      </div>
    </nav>
  )
}