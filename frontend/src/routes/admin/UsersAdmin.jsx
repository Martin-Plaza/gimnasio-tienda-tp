import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

const empty = { name:'', email:'', password:'', role:'user' }

export default function UsersAdmin(){
  const [list, setList] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState(null)

  const load = ()=> api('/users').then(setList).catch(e=>setError(e.message))
  useEffect(()=>{ load() },[])

  const onChange = (e)=> setForm(f=>({...f,[e.target.name]:e.target.value}))
  const validate = ()=>{
    if(form.name.trim().length<2) return 'Nombre muy corto'
    if(!form.email.includes('@')) return 'Email inválido'
    if(!editId && form.password.length<6) return 'Contraseña mínima 6'
    if(!['user','admin','super-admin'].includes(form.role)) return 'Rol inválido'
    return null
  }

  const submit = async (e)=>{
    e.preventDefault(); setError(null)
    const v = validate(); if(v) return setError(v)
    try{
      if(editId){
        const payload = { name:form.name, email:form.email, role:form.role }
        if(form.password) payload.password = form.password
        await api(`/users/${editId}`,{method:'PUT', body:JSON.stringify(payload)})
      }else{
        await api('/users',{method:'POST', body:JSON.stringify(form)})
      }
      setForm(empty); setEditId(null); load()
    }catch(e){ setError(e.message) }
  }

  const edit = (u)=>{ setEditId(u.id); setForm({name:u.name, email:u.email, password:'', role:u.role}) }
  const del = async (id)=>{ if(!confirm('¿Eliminar usuario?')) return; await api(`/users/${id}`,{method:'DELETE'}); load() }

  return (
    <div>
      <h1>ABM Usuarios</h1>

      <form onSubmit={submit} className="card" style={{maxWidth:520, marginBottom:16}}>
        <label className="label">Nombre</label>
        <input name="name" className="input" value={form.name} onChange={onChange} required/>
        <label className="label">Email</label>
        <input name="email" className="input" value={form.email} onChange={onChange} required/>
        <label className="label">Contraseña {editId && <span className="help">(dejar vacía para no cambiar)</span>}</label>
        <input name="password" className="input" type="password" value={form.password} onChange={onChange} required={!editId}/>
        <label className="label">Rol</label>
        <select name="role" className="input" value={form.role} onChange={onChange}>
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="super-admin">super-admin</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn primary" type="submit">{editId ? 'Guardar cambios' : 'Crear'}</button>
          {editId && <button className="btn" onClick={(e)=>{e.preventDefault(); setEditId(null); setForm(empty)}}>Cancelar</button>}
        </div>
      </form>

      <table className="table">
        <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          {list.map(u=>(
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="badge">{u.role}</span></td>
              <td className="row">
                <button className="btn" onClick={()=>edit(u)}>Editar</button>
                <button className="btn danger" onClick={()=>del(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}