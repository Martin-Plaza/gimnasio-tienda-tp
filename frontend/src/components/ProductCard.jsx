import { Link } from 'react-router-dom'

export default function ProductCard({ p, onAdd }){
  return (
    <div className="card">
      <img src={p.image_url || 'https://via.placeholder.com/600x400?text=Producto'} alt={p.name}/>
      <strong>{p.name}</strong>
      <span className="help">${Number(p.price).toFixed(2)} · Stock: {p.stock}</span>
      <div className="row">
        <Link className="btn" to={`/producto/${p.id}`}>Ver</Link>
        <button className="btn primary" onClick={()=>onAdd(p)} disabled={p.stock<=0}>Agregar</button>
      </div>
    </div>
  )
}