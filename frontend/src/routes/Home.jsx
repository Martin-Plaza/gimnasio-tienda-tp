import { useEffect, useState } from 'react';
import { api, API_URL } from '../services/api.js';
import { readCart, saveCart } from '../services/cart.js';

// --------- MODULO CHECKEADO -------------//


//funcion CHECKEADA
export default function Home() {
  //products se mapea
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);



  

  //USEEFECT CHECKEADO
  //llama al GET de la api en products.routes.js
  useEffect(() => {
    (async () => {
      const data = await api('/products');
      //metemos en products todo lo de data, que traemos con la api
      setProducts(data || []);
    })();
  }, []);







  //funcion CHECKEADA
  const addToCart = (p) => {
    const id    = p.id;
    const name  = p.name;
    const price = Number(p.price);

    //readCart y saveCart son importaciones de cart.js
    //leemos si hay carrito actual
    const cart = readCart();
    //findindex busca id asociado al producto actual que clickeamos, si no encuentra ningun numero asociado devuelve -1
    const idx  = cart.findIndex(i => (i.id) === id);

    //si no encuentra hace push y agrega a localstorage cantidad 1
    if (idx === -1) cart.push({ id, name, price, qty: 1 });
    //sino sumamos 1 a ese id del producto
    else cart[idx].qty += 1;

    saveCart(cart);
    setMsg(`${name} agregado al carrito`);
    setTimeout(() => setMsg(null), 1200);
  };






  //funcion CHECKEADA
  //a imgSrc le pasamos p, que es de cada elemento de product
  const imgSrc = (p) => {
    //raw primero ve si es proveniente de url externa, luego si viene de la base de datos
    //y si no es vacio. ?? devuelve el primer elemento NO NULO, es decir, lo guardaria en raw si no es nulo.
    const raw = p.image_url ?? '';
    //si raw empieza con http quiere decir que es una url y hace el primer return
    if (raw.startsWith('http')) return raw;
    //sino devuelve la importacion de api (que viene de api.js) que tiene la api de local y concatena con raw.
    return `${API_URL}${raw || '/images/placeholder.jpeg'}`;
  };




  //funcion CHECKEADA
  //trim elimina los espacios en blanco
  const desc = (p) => (p.description ?? '').trim();



  return (
    <div className="container py-4 w-100">
      <h1 className="mb-3">Productos</h1>

      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {/* Grilla Bootstrap */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4" style={{ justifyContent: 'center'}}>
        {/*mapeamos products, y p lo utilizamos para iterar en cada elemento del arreglo*/}
        {products.map(p => (
          <div className="col" key={p.id}>
            <div className="card fx-card h-100">
              <div className="fx-img" style={{ maxHeight: 260 }}>
                {/*aca llamamos a imgSrc y le pasamos cada elemento*/}
                <img
                  src={imgSrc(p)}
                  alt={p.nombre}
                  style={{ width: '100%', height: 260, objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = `${API_URL}/images/placeholder.jpeg`; }}
                />
                
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-1">{p.name}</h5>
                {desc(p) && <div className="text-muted mb-2">{desc(p)}</div>}

                <div className="text-muted">Stock: {Number(p.stock)}</div>
                <div className="fx-price my-3">
                  ${Number(p.price).toFixed(2)}
                </div>

                {/* Acciones (botones) */}
                <div className="fx-actions">
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => addToCart(p)}
                    disabled={(Number(p.stock)) <= 0}
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