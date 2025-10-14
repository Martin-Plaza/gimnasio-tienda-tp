// frontend/src/routes/Home.jsx
import { useEffect, useState } from 'react'
import { api, API_URL } from '../services/api.js'
import { readCart, saveCart } from '../services/cart.js'
import { Link } from 'react-router-dom'

const srcFor = (u) =>
  !u ? `${API_URL}/images/placeholder.jpeg` :
  (u.startsWith('http') ? u : API_URL + u)

export default function Home(){
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        const data = await api('/products')
        setProducts(data)
      }catch(e){ setError(e.message) }
      finally{ setLoading(false) }
    })()
  },[])

  const addToCart = (p)=>{
    const cart = readCart()
    const i = cart.findIndex(x=>x.product_id===p.id)
    if(i>=0) cart[i].qty = Math.min(cart[i].qty+1, p.stock)
    else cart.push({ product_id:p.id, name:p.name, price:p.price, qty:1 })
    saveCart(cart)
    window.dispatchEvent(new Event('cart:changed'))
    alert('Agregado al carrito')
  }

  if (loading) return <p className="help">Cargando…</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Productos</h1>
      {!products.length && <p className="help">No hay productos.</p>}
      <div className="grid">
        {products.map(p=>(
          <div key={p.id} className="card">
            <Link to={`/producto/${p.id}`}>
              <img
                src={srcFor(p.image_url)}    // ⬅️ IMPORTANTE
                alt={p.name}
                style={{width:180,height:180,objectFit:'cover',borderRadius:8}}
                onError={(e)=>{ e.currentTarget.src = `${API_URL}/images/placeholder.jpeg` }}
              />
            </Link>
            <h3>{p.name}</h3>
            <p className="muted">${Number(p.price).toFixed(2)} · Stock: {p.stock}</p>
            <div className="row">
              <button className="btn" onClick={()=>addToCart(p)}>Agregar</button>
              <Link className="btn" to={`/producto/${p.id}`}>Ver</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}