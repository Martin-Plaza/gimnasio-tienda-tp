import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api.js'

export default function ProductDetail(){
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    api(`/products?id=${id}`)
      .then(list=>setP(list[0]||null))
      .catch(e=>setError(e.message))
  },[id])

  const add = ()=>{
    const cart = JSON.parse(localStorage.getItem('cart')||'[]')
    const idx = cart.findIndex(i=>i.product_id===p.id)
    if(idx>=0){ cart[idx].qty = Math.min(cart[idx].qty+1, p.stock) }
    else { cart.push({product_id:p.id, name:p.name, price:p.price, qty:1}) }
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Agregado al carrito')
  }

  if(error) return <p className="error">{error}</p>
  if(!p) return <p className="help">Cargando...</p>

  return (
    <div className="card" style={{maxWidth:720, margin:'16px auto'}}>
      <img src={p.image_url || 'https://via.placeholder.com/1200x600?text=Producto'} alt={p.name}/>
      <h2>{p.name}</h2>
      <p className="help">${Number(p.price).toFixed(2)} · Stock: {p.stock}</p>
      <p>{p.description || 'Sin descripción.'}</p>
      <button className="btn primary" onClick={add} disabled={p.stock<=0}>Agregar al carrito</button>
    </div>
  )
}