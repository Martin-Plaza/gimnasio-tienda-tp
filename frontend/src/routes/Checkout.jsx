import { useState } from 'react';
import { api } from '../services/api.js';
import { readCart, clearCart } from '../services/cart.js';
import { useNavigate } from 'react-router-dom';

export default function Checkout(){
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const cart = readCart();
  const total = cart.reduce((s,i)=> s + Number(i.price)*Number(i.qty), 0);

  const submit = async (e)=>{
    e.preventDefault();
    setError(null);
    if (address.trim().length < 5) { setError('La dirección es demasiado corta'); return; }
    if (!cart.length) { setError('El carrito está vacío'); return; }

    try{
      setLoading(true);
      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          address: address.trim(),
          items: cart.map(c=>({ product_id: c.product_id, qty: c.qty }))
        })
      });
      // res = { ok: true, orderId, total }
      clearCart();
      navigate('/mis-ordenes');
    }catch(err){
      setError(err.message || 'Error al crear la orden');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <p className="help">Total a pagar: ${total.toFixed(2)}</p>

      <form onSubmit={submit} className="card" style={{maxWidth:520}}>
        <label className="label">Dirección de envío</label>
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