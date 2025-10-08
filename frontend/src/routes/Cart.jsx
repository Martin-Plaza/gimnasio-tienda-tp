import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Cart(){
  const [cart, setCart] = useState([])

  const load = ()=>{
    setCart(JSON.parse(localStorage.getItem('cart')||'[]'))
  }

  useEffect(()=>{ load() },[])

  const updateQty = (idx, qty)=>{
    const next = [...cart]
    next[idx].qty = Math.max(1, Number(qty)||1)
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }
  const removeItem = (idx)=>{
    const next = cart.filter((_,i)=>i!==idx)
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }
  const clear = ()=>{
    localStorage.removeItem('cart'); setCart([])
  }

  const total = cart.reduce((a,i)=>a + i.price*i.qty, 0)

  return (
    <div>
      <h1>Carrito</h1>
      {!cart.length && <p className="help">Tu carrito está vacío.</p>}
      {!!cart.length && (
        <>
          <table className="table">
            <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              {cart.map((it, idx)=>(
                <tr key={idx}>
                  <td>{it.name}</td>
                  <td>${Number(it.price).toFixed(2)}</td>
                  <td><input className="input" style={{width:80}} type="number" min="1" value={it.qty}
                      onChange={e=>updateQty(idx, e.target.value)} /></td>
                  <td>${Number(it.price*it.qty).toFixed(2)}</td>
                  <td><button className="btn danger" onClick={()=>removeItem(idx)}>Quitar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{justifyContent:'space-between', marginTop:12}}>
            <button className="btn" onClick={clear}>Vaciar</button>
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
          <div style={{marginTop:12}}>
            <Link className="btn primary" to="/checkout">Continuar al Checkout</Link>
          </div>
        </>
      )}
    </div>
  )
}