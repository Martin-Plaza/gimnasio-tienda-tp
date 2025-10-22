import { useState } from 'react';
import { api } from '../services/api.js';
import { readCart, clearCart } from '../services/cart.js';
import { useNavigate } from 'react-router-dom';


// --------- MODULO CHECKEADO -------------//


//funcion CHECKEADA
export default function Checkout(){
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  //funcion CHECKEADA
  // hacemos un condicional con el ? para verificar si es un arreglo:
  //si es arreglo hace el map, sino guarda un arreglo vacio.
  const cart = Array.isArray(readCart())
    ? readCart().map(i => ({
        id: i.id,
        qty: Number(i.qty),
        price: Number(i.price),
        name: i.name
      }))
    : [];



  //funcion CHECKEADA
  //de cart multiplicamos el precio por la cantidad de cada producto.
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);


  //si el carrito no tiene longitud se renderiza carrito vacio
  if (!cart.length) {
    return (
      <div className="container">
        <h2>Checkout</h2>
        <p className="muted">Tu carrito está vacío.</p>
      </div>
    );
  }

  //formulario de direccion
  const submit = async (e)=>{
    e.preventDefault();
    setError(null);
    //muestra cargando setLoading
    setLoading(true);
    //en el bloque try arma el objeto de carrito para enviar a ordenes
    try{
      const payload = {
        address,
        items: cart.map(i => ({
          product_id: Number(i.id),
          qty: Number(i.qty),
          price: Number(i.price)
        }))
      };
      //usa POST en orders y envia el objeto en formato json, limpia el carrito y usa navigate para mis-ordenes
      await api('/orders', { method:'POST', body: JSON.stringify(payload) });
      clearCart();
      navigate('/mis-ordenes');
    }catch(err){
      setError(err.message || 'Error al procesar el pedido');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Checkout</h2>
      <p>Total a pagar: ${total.toFixed(2)}</p>
      <form onSubmit={submit}>
        <input
          className="input"
          value={address}
          onChange={e=>setAddress(e.target.value)}
          placeholder="Calle y número"
          required
        />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Procesando…' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}