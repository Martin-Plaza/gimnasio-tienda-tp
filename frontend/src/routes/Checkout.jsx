import { useState } from 'react';
import { api } from '../services/api.js';
import { readCart, clearCart } from '../services/cart.js';
import { useNavigate } from 'react-router-dom';

export default function Checkout(){
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Carrito válido: adaptamos product_id → id si hace falta
  const cart = Array.isArray(readCart())
    ? readCart().map(i => ({
        id: i.id ?? i.product_id,    // ✅ Soporta ambas formas
        qty: Number(i.qty),
        price: Number(i.price),
        name: i.name
      }))
    : [];

  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);

  if (!cart.length) {
    return (
      <div className="container">
        <h2>Checkout</h2>
        <p className="muted">Tu carrito está vacío.</p>
      </div>
    );
  }

  const submit = async (e)=>{
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      const payload = {
        address,
        items: cart.map(i => ({
          product_id: Number(i.id),   // ✅ Usa ID real
          qty: Number(i.qty),
          price: Number(i.price)
        }))
      };
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