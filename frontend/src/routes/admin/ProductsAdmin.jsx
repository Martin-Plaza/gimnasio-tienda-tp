// frontend/src/routes/ProductsAdmin.jsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';




//----------MODULO CHECKEADO ---------//





//FUNCION SIN REVISAR
export default function ProductsAdmin(){
  const [list, setList]   = useState([]);
  const [form, setForm]   = useState({ name:'', price:'', stock:'', image_url:'', description:'' });
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = creando




  //FUNCION CHECKEADA
  //load hace la llamada a la api products y renderiza todos en productsadmin
  const load = async ()=>{
    try{
      //guardamos en data la llamada a la api, que viene de la ruta products.routes, y que viene de la llamada a la db product.js
      const data = await api('/products');
      setList(Array.isArray(data) ? data : data.products || []);
    }catch(e){
      setError(e.message || 'Error al cargar');
    }
  };



  //USEEFECT CHECKEADO
  //llama a load una vez
  useEffect(()=>{ load(); },[]);






  //FUNCION CHECKEADA
  //resetForm resetea el form a vacio cada campo cuando enviamos el form (apretamos el boton)
  const resetForm = ()=>{
    setForm({ name:'', price:'', stock:'', image_url:'', description:'' });
    setEditingId(null);
  };





  //FUNCION CHECKEADA
  const onSubmit = async (e)=>{
    e.preventDefault();
    setError(null);
    //payload es un objeto con todos los atributos del objeto, proveniente de los campos del formulario
    //armamos para actualizar
    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || '',
      description: form.description || ''
    };
    try{
      //si editingId no es null (inicia como null) hacemos PUT a la DB
      if (editingId) {
        //le agregamos el json de payload con PUT (actualizar), a products.routes
        await api(`/products/${editingId}`, { method:'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/products', { method:'POST', body: JSON.stringify(payload) });
      }
      //reseteamos el form
      resetForm();
      //ejecutamos nuevamente load para que aparezca el actualizado
      await load();
    }catch(err){
      setError(err.message || 'Error guardando');
    }
  };




  



  //FUNCION CHECKEADA
  const onEditStart = (p)=>{
    //guardamos en editingId el id seleccionado del producto
    setEditingId(p.id);
    //seteamos el form con todos los campos del producto seleccionado, si no tiene lo dejamos vacio
    setForm({
      name: p.name ?? '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      image_url: p.image_url ?? '',
      description: p.description ?? ''
    });
    //hacemos un scroll hasta el inicio con top 0
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  //FUNCION CHECKEADA
  //si cancelamos la edicion se resetea el form
  const onCancelEdit = ()=> resetForm();




  //FUNCION CHECKEADA
  const onDelete = async (id)=>{
    //le pasamos a onDelete el parametro del id
    //si el modal es false no lo elimina, no hace nada.
    if(!confirm(`¿Eliminar producto #${id}?`)) return;
    try{
      //si es true el modal llama a la ruta products.routes, metodoo delete
      await api(`/products/${id}`, { method:'DELETE' });
      //carga nuevamente todos los productos con load
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