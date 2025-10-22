import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readCart, saveCart, clearCart } from '../services/cart.js';



// --------- MODULO CHECKEADO -------------//



//funcion CHECKEADA
export default function Cart(){
  const [cart, setCart] = useState([]);

  //seteamos cart con el carrito que haya en localstorage con readCart
  useEffect(()=>{ setCart(readCart()); },[]);

  //creamos sync que hace que cada cambio que hagamos en el carrito se guarde, aca next se llama
  //para saber que es el que se le va a pasar, pero se puede llamar de cualquier manera
  const sync = (next)=>{ setCart(next); saveCart(next); };



  //cambia el estado del carrito, le pasamos cantidad y index
  const updateQty = (idx, qty)=>{
    //creamos next, que hace spread operator sobre el carrito
    const next = [...cart];
    //a la cantidad del producto seleccionado (por el index) le sumamos maximo 1
    next[idx].qty = Math.max(1, Number(qty));
    //lo seteamos en el carrito.
    sync(next);
  };



  
  //funcion CHECKEADA
  //funcion para eliminar el carrito, pasandole el indice
  const removeItem = (idx)=>{
    //filtramos el arreglo y mostramos todos los productos menos el que sea igual al indice que le pasamos
    //dentro del filter el _ significa que es una variable que no vamos a usar pero que por convencion tiene que estar en el filter
    const next = cart.filter((_,i)=> i !== idx);
    //seteamos el carrito.
    sync(next);
  };




  //funcion CHECKEADA
  //funcion para borrar el carrito.
  const onClear = ()=> {
    if (!confirm('¿Vaciar el carrito completo?')) return;
    //si el confirm es true hacemos clear con clearCart (que vacia el local storage) y seteamos el useState con arreglo vacio
    clearCart(); setCart([]);
  };



  //funcion CHECKEADA
  //suma de cada producto el total, multiplicandolo.
  const total = cart.reduce((a,i)=> a + i.price * i.qty, 0);



  return (
    <div className="container py-4">
      <h1 className="mb-3">Carrito</h1>

      {!cart.length && <p className="text-muted">Tu carrito está vacío.</p>}

      {cart.length && (
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