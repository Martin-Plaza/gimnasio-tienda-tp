import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function ProductsAdmin(){
  const [list, setList]   = useState([]);
  const [form, setForm]   = useState({ name:'', price:'', stock:'', image_url:'', description:'' });
  const [error, setError] = useState(null);

  const load = async ()=>{
    try{ setList(await api('/products')); }
    catch(e){ setError(e.message); }
  };
  useEffect(()=>{ load(); },[]);

  const onCreate = async (e)=>{
    e.preventDefault();
    setError(null);
    try{
      await api('/products', {
        method:'POST',
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          image_url: form.image_url || '',
          description: form.description || ''
        })
      });
      setForm({ name:'', price:'', stock:'', image_url:'', description:'' });
      await load();
    }catch(err){ setError(err.message); }
  };

  const onDelete = async (id)=>{
    if(!confirm(`¿Eliminar producto #${id}?`)) return;
    try{
      await api(`/products/${id}`, { method:'DELETE' });
      await load();
    }catch(err){ setError(err.message); }
  };

  return (
    <div>
      <h1>ABM Productos</h1>

      <form className="card" onSubmit={onCreate}>
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
        <button className="btn">Crear</button>
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
              <td>
                <button className="btn" onClick={()=>onDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}