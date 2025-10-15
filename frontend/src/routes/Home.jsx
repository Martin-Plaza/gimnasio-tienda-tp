import { useEffect, useState } from 'react';
import { api, API_URL } from '../services/api.js';
import { readCart, saveCart } from '../services/cart.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await api('/products');
      setProducts(data || []);
    })();
  }, []);

  const addToCart = (p) => {
    // Normalizamos campos por si vienen en mayúsculas desde la DB
    const id = p.id ?? p.ProdId;
    const name = p.name ?? p.Nombre;
    const price = Number(p.price ?? p.Precio);
    const stock = Number(p.stock ?? p.Stock);

    const cart = readCart();
    const idx = cart.findIndex(i => (i.id ?? i.product_id) === id);

    if (idx === -1) cart.push({ id, name, price, qty: 1 });
    else cart[idx].qty = Math.min((Number(cart[idx].qty) || 1) + 1, stock || 9999);

    saveCart(cart);
    setMsg(`Agregado: ${name}`);
    setTimeout(() => setMsg(null), 1200);
  };

  const imgSrc = (p) => {
    const raw = p.image_url ?? p.ImageUrl ?? '';
    // Si ya es URL absoluta, úsala; si no, sirve desde el backend (/images/*)
    if (raw.startsWith('http')) return raw;
    return `${API_URL}${raw || '/images/placeholder.jpeg'}`;
  };

  const desc = (p) => (p.description ?? p.Descripcion ?? '').trim();

  return (
    <div className="container">
      <h2>Productos</h2>
      {msg && <p className="help">{msg}</p>}

      <div className="grid">
        {products.map(p => (
          <div key={p.id ?? p.ProdId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <img
              src={imgSrc(p)}
              alt={p.name ?? p.Nombre}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12 }}
              onError={(e) => { e.currentTarget.src = `${API_URL}/images/placeholder.jpeg`; }}
            />
            <h3>{p.name ?? p.Nombre}</h3>
            {/* Descripción adentro de la card */}
            {(desc(p)) && <p className="muted" style={{ minHeight: 40 }}>{desc(p)}</p>}

            <p className="muted">
              ${Number(p.price ?? p.Precio).toFixed(2)} · Stock: {Number(p.stock ?? p.Stock)}
            </p>

            <div className="row" style={{ marginTop: 4 }}>
              <button className="btn" onClick={() => addToCart(p)}>Agregar</button>
              {/* Se quitó el botón "Ver" */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}