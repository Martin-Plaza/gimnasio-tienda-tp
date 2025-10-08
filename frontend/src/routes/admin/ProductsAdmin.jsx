import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

const empty = { name:'', price:'', stock:'', image_url:'' }

export default function ProductsAdmin(){
  const [list, setList] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState(null)

  const load = ()=> api('/products').then(setList).catch(e=>setError(e.message))
  useEffect(()=>{ load() },[])

  const onChange = (e)=> setForm(f=>({...f,[e.target.name]:e.target.value}))
  const validate = ()=>{
    if(form.name.trim().length<2) return 'Nombre muy corto'
    if(Number(form.price)<=0) return 'Precio inválido'
    if(Number.isNaN(Number(form.stock)) || Number(form.stock)<0) return 'Stock inválido'
    return null
  }

  const submit = async (e)=>{
    e.preventDefault(); setError(null)
    const v = validate(); if(v) return setError(v)
    try{
      if(editId){
        await api(`/products/${editId}`,{method:'PUT', body:JSON.stringify({...form, price:Number(form.price), stock:Number(form.stock)})})
      }else{
        await api('/products',{method:'POST', body:JSON.stringify({...form, price:Number(form.price), stock:Number(form.stock)})})
      }
      setForm(empty); setEditId(null); load()
    }catch(e){ setError(e.message) }
  }

  const edit = (p)=>{ setEditId(p.id); setForm({name:p.name, price:String(p.price), stock:String(p.stock), image_url:p.image_url||''}) }
  const del = async (id)=>{ if(!confirm('¿Eliminar producto?')) return; await api(`/products/${id}`,{method:'DELETE'}); load() }

  return (
    <div>
      <h1>ABM Productos</h1>

      <form onSubmit={submit} className="card" style={{maxWidth:520, marginBottom:16}}>
        <label className="label">Nombre</label>
        <input name="name" className="input" value={form.name} onChange={onChange} required/>
        <label className="label">Precio</label>
        <input name="price" className="input" type="number" step="0.01" value={form.price} onChange={onChange} required/>
        <label className="label">Stock</label>
        <input name="stock" className="input" type="number" value={form.stock} onChange={onChange} required/>
        <label className="label">Imagen (URL)</label>
        <input name="image_url" className="input" value={form.image_url} onChange={onChange}/>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn primary" type="submit">{editId ? 'Guardar cambios' : 'Crear'}</button>
          {editId && <button className="btn" onClick={(e)=>{e.preventDefault(); setEditId(null); setForm(empty)}}>Cancelar</button>}
        </div>
      </form>

      <table className="table">
        <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {list.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td className="row">
                <button className="btn" onClick={()=>edit(p)}>Editar</button>
                <button className="btn danger" onClick={()=>del(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}