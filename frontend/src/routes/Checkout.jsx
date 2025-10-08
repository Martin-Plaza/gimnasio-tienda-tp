import { useState } from 'react'
import { api } from '../services/api.js'

export default function Checkout(){
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const cart = JSON.parse(localStorage.getItem('cart')||'[]')
  const total = cart.reduce((a,i)=>a + i.price*i.qty, 0)

  const submit = async (e)=>{
    e.preventDefault()
    setMsg(null); setError(null)

    // Validaciones mínimas
    if(address.trim().length < 5){ setError('La dirección es demasiado corta'); return }
    if(!cart.length){ setError('El carrito está vacío'); return }

    try{
      const order = await api('/orders', {
        method:'POST',
        body: JSON.stringify({ items: cart.map(c=>({product_id:c.product_id, qty:c.qty})), address })
      })
      localStorage.removeItem('cart')
      setMsg(`Orden #${order.id} creada correctamente`)
    }catch(e){ setError(e.message) }
  }

  return (
    <div>
      <h1>Checkout</h1>
      <p className="help">Total a pagar: ${total.toFixed(2)}</p>
      <form onSubmit={submit} className="card" style={{maxWidth:520}}>
        <label className="label">Dirección de envío</label>
        <input className="input" value={address} onChange={e=>setAddress(e.target.value)} required/>
        {error && <p className="error">{error}</p>}
        {msg && <p className="help">{msg}</p>}
        <button className="btn primary" type="submit">Confirmar pedido</button>
      </form>
    </div>
  )
}