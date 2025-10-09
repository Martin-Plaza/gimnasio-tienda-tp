import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import ProductCard from '../components/ProductCard.jsx'
import { readCart, saveCart } from '../services/cart.js'

export default function Home(){
  const [q, setQ] = useState('')
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{
    api('/products')
      .then(setProducts)
      .catch(e=>setError(e.message))
  },[])

const addToCart = (p)=>{
  const cart = readCart()
  const idx = cart.findIndex(i=>i.product_id===p.id)
  if(idx>=0){ cart[idx].qty = Math.min(cart[idx].qty+1, p.stock) }
  else { cart.push({product_id:p.id, name:p.name, price:p.price, qty:1}) }
  saveCart(cart)
  alert('Agregado al carrito')
}

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <div className="row" style={{marginBottom:12}}>
        <input className="input" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {filtered.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
      </div>
    </>
  )
}