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
    const id    = p.id ?? p.ProdId;
    const name  = p.name ?? p.Nombre;
    const price = Number(p.price ?? p.Precio);
    const stock = Number(p.stock ?? p.Stock);

    const cart = readCart();
    const idx  = cart.findIndex(i => (i.id ?? i.product_id) === id);

    if (idx === -1) cart.push({ id, name, price, qty: 1 });
    else cart[idx].qty = Math.min((Number(cart[idx].qty) || 1) + 1, stock || 9999);

    saveCart(cart);
    setMsg(`Agregado: ${name}`);
    setTimeout(() => setMsg(null), 1200);
  };

  const imgSrc = (p) => {
    const raw = p.image_url ?? p.ImageUrl ?? '';
    if (raw.startsWith('http')) return raw;
    return `${API_URL}${raw || '/images/placeholder.jpeg'}`;
  };

  const desc = (p) => (p.description ?? p.Descripcion ?? '').trim();

  return (
    <div className="container py-4">
      <h1 className="mb-3">Productos</h1>

      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {/* Grilla Bootstrap */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {products.map(p => (
          <div className="col" key={p.id ?? p.ProdId}>
            <div className="card fx-card h-100">
              <div className="fx-img" style={{ maxHeight: 260 }}>
                <img
                  src={imgSrc(p)}
                  alt={p.name ?? p.Nombre}
                  style={{ width: '100%', height: 260, objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = `${API_URL}/images/placeholder.jpeg`; }}
                />
              </div>

              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-1">{p.name ?? p.Nombre}</h5>
                {desc(p) && <div className="text-muted mb-2">{desc(p)}</div>}

                <div className="text-muted">Stock: {Number(p.stock ?? p.Stock)}</div>
                <div className="fx-price my-3">
                  ${Number(p.price ?? p.Precio).toFixed(2)}
                </div>

                {/* Acciones SIEMPRE alineadas abajo */}
                <div className="fx-actions">
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => addToCart(p)}
                    disabled={(Number(p.stock ?? p.Stock) || 0) <= 0}
                    title={(Number(p.stock ?? p.Stock) || 0) <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!products.length && (
          <div className="col">
            <p className="text-muted">No hay productos disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}