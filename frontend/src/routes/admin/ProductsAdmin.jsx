// frontend/src/routes/ProductsAdmin.jsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function ProductsAdmin(){
  const [list, setList]   = useState([]);
  const [form, setForm]   = useState({ name:'', price:'', stock:'', image_url:'', description:'' });
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = creando

  const load = async ()=>{
    try{
      const data = await api('/products');
      setList(Array.isArray(data) ? data : data.products || []);
    }catch(e){
      setError(e.message || 'Error al cargar');
    }
  };
  useEffect(()=>{ load(); },[]);

  const resetForm = ()=>{
    setForm({ name:'', price:'', stock:'', image_url:'', description:'' });
    setEditingId(null);
  };

  const onSubmit = async (e)=>{
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || '',
      description: form.description || ''
    };

    try{
      if (editingId) {
        await api(`/products/${editingId}`, { method:'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/products', { method:'POST', body: JSON.stringify(payload) });
      }
      resetForm();
      await load();
    }catch(err){
      setError(err.message || 'Error guardando');
    }
  };

  const onEditStart = (p)=>{
    setEditingId(p.id);
    setForm({
      name: p.name ?? '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      image_url: p.image_url ?? '',
      description: p.description ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCancelEdit = ()=> resetForm();

  const onDelete = async (id)=>{
    if(!confirm(`¿Eliminar producto #${id}?`)) return;
    try{
      await api(`/products/${id}`, { method:'DELETE' });
      await load();
    }catch(err){
      setError(err.message || 'Error eliminando');
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">ABM Productos</h1>

      <form className="card shadow-sm mb-4" onSubmit={onSubmit}>
        <div className="card-body">
          <label className="form-label">Nombre</label>
          <input className="form-control mb-3" value={form.name}
                 onChange={e=>setForm(f=>({...f,name:e.target.value}))} />

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Precio</label>
              <input className="form-control" type="number" step="0.01" value={form.price}
                     onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Stock</label>
              <input className="form-control" type="number" value={form.stock}
                     onChange={e=>setForm(f=>({...f,stock:e.target.value}))} />
            </div>
          </div>

          <label className="form-label mt-3">Imagen (URL o /images/archivo.jpeg)</label>
          <input className="form-control mb-3" value={form.image_url}
                 onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} />

          <label className="form-label">Descripción (opcional)</label>
          <input className="form-control mb-3" value={form.description}
                 onChange={e=>setForm(f=>({...f,description:e.target.value}))} />

          {error && <p className="text-danger small mb-3">{error}</p>}

          <div className="d-flex gap-2">
            <button className="btn btn-dark">
              {editingId ? 'Guardar cambios' : 'Crear'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <h2 className="h4 mb-3">Listado</h2>
      <table className="table table-striped align-middle">
        <thead className="table-light">
          <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {list.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={()=>onEditStart(p)}>
                  Modificar
                </button>
                <button className="btn btn-danger btn-sm" onClick={()=>onDelete(p.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr><td colSpan={5}><p className="text-muted mb-0">No hay productos.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}