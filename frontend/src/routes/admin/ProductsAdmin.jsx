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
        // EDITAR
        await api(`/products/${editingId}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});
      } else {
        // CREAR
        await api('/products', {
  method: 'POST',
  body: JSON.stringify(payload)
});
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
    <div>
      <h1>ABM Productos</h1>

      <form className="card" onSubmit={onSubmit}>
        <label className="label">Nombre</label>
        <input className="input" value={form.name}
               onChange={e=>setForm(f=>({...f,name:e.target.value}))} />

        <label className="label">Precio</label>
        <input className="input" type="number" step="0.01" value={form.price}
               onChange={e=>setForm(f=>({...f,price:e.target.value}))} />

        <label className="label">Stock</label>
        <input className="input" type="number" value={form.stock}
               onChange={e=>setForm(f=>({...f,stock:e.target.value}))} />

        <label className="label">Imagen (URL o /images/archivo.jpeg)</label>
        <input className="input" value={form.image_url}
               onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} />

        <label className="label">Descripción (opcional)</label>
        <input className="input" value={form.description}
               onChange={e=>setForm(f=>({...f,description:e.target.value}))} />

        {error && <p className="error">{error}</p>}

        <div style={{display:'flex', gap:8}}>
          <button className="btn">
            {editingId ? 'Guardar cambios' : 'Crear'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2 style={{marginTop:16}}>Listado</h2>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {list.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <button className="btn" onClick={()=>onEditStart(p)}>Modificar</button>
                <button className="btn" onClick={()=>onDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}