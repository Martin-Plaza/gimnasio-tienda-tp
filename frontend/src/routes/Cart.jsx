import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCart, saveCart, clearCart } from '../services/cart.js';

export default function Cart(){
  const [cart, setCart] = useState([]);

  useEffect(()=>{ setCart(readCart()); },[]);

  const sync = (next)=>{ setCart(next); saveCart(next); };

  const updateQty = (idx, qty)=>{
    const next = [...cart];
    next[idx].qty = Math.max(1, Number(qty) || 1);
    sync(next);
  };
  const removeItem = (idx)=>{
    const next = cart.filter((_,i)=> i !== idx);
    sync(next);
  };
  const onClear = ()=> {
    if (!confirm('¿Vaciar el carrito completo?')) return;
    clearCart(); setCart([]);
  };

  const total = cart.reduce((a,i)=> a + i.price * i.qty, 0);

  return (
    <div className="container py-4">
      <h1 className="mb-3">Carrito</h1>

      {!cart.length && <p className="text-muted">Tu carrito está vacío.</p>}

      {!!cart.length && (
        <>
          <table className="table table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th style={{width:110}}>Cantidad</th>
                <th>Subtotal</th>
                <th style={{width:100}}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((it, idx)=>(
                <tr key={idx}>
                  <td>{it.name}</td>
                  <td>${Number(it.price).toFixed(2)}</td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      style={{ width: 90 }}
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={e=>updateQty(idx, e.target.value)}
                    />
                  </td>
                  <td>${Number(it.price*it.qty).toFixed(2)}</td>
                  <td className="text-end">
                    <button className="btn btn-danger btn-sm" onClick={()=>removeItem(idx)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Barra inferior: Vaciar (botón) + Total + Checkout */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mt-3">
            <button type="button" className="btn btn-outline-dark" onClick={onClear}>
              Vaciar
            </button>

            <strong className="fs-5">Total: ${total.toFixed(2)}</strong>

            <Link className="btn btn-dark" to="/checkout">
              Continuar al Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}