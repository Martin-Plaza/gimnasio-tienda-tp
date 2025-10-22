import { Link } from 'react-router-dom';



//----------SIN REVISAR----------//



//FUNCION SIN REVISAR
export default function ProductCard({ p, onAdd }) {
  const img = p.image_url || 'https://via.placeholder.com/600x400?text=Producto';
  const price = Number(p.price).toFixed(2);





  
  return (
    <div className="card fx-card h-100">
      <div className="fx-img">
        <img src={img} alt={p.name} />
      </div>

      <div className="card-body">
        <h5 className="card-title mb-1">{p.name}</h5>
        {p.description && <div className="text-muted mb-2">{p.description}</div>}

        <div className="text-muted">Stock: {p.stock}</div>
        <div className="fx-price my-3">${price}</div>

        {/* SIEMPRE A LA MISMA ALTURA */}
        <div className="fx-actions d-flex gap-2">
          <Link className="btn btn-outline-dark btn-sm w-50" to={`/producto/${p.id}`}>
            Ver
          </Link>
          <button
            className="btn btn-dark btn-sm w-50"
            onClick={() => onAdd(p)}
            disabled={p.stock <= 0}
            title={p.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}