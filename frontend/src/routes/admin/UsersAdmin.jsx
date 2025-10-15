import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UsersAdmin(){
  const { hasRole } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async ()=>{
    setErr(null);
    try {
      const data = await api('/users');
      setRows(data.map(u => ({
        id: u.id ?? u.Id,
        name: u.name ?? u.Nombre,
        email: u.email ?? u.Email,
        role: u.role ?? u.Rol ?? u.Nivel
      })));
    } catch(e) {
      setErr(e.message);
    }
  };

  useEffect(()=>{ load(); },[]);

  const onChange = (e)=>{
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const createUser = async (e)=>{
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try{
      if (!hasRole('super-admin')) {
        throw new Error('Solo super-admin puede crear usuarios');
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      };
      const u = await api('/users', { method:'POST', body: JSON.stringify(payload) });
      setRows(rs => [{ id:u.id, name:u.name, email:u.email, role:u.role }, ...rs]);
      setForm({ name:'', email:'', password:'', role:'user' });
    }catch(e){
      setErr(e.message || 'No se pudo crear el usuario');
    }finally{
      setLoading(false);
    }
  };

  const removeUser = async (id)=>{
    if (!hasRole('super-admin')) return alert('Solo super-admin');
    const ok = window.confirm(`¿Eliminar usuario #${id}?`);
    if (!ok) return;
    try{
      await api(`/users/${id}`, { method:'DELETE' });
      setRows(rs => rs.filter(r => r.id !== id));
    }catch(e){
      alert(e.message || 'Error al eliminar');
    }
  };

  const promote = async (id, role)=>{
    if (!hasRole('super-admin')) return alert('Solo super-admin');
    try{
      await api(`/users/${id}/role`, { method:'PUT', body: JSON.stringify({ role }) });
      setRows(rs => rs.map(r => r.id === id ? { ...r, role } : r));
    }catch(e){
      alert(e.message || 'Error al cambiar rol');
    }
  };

  return (
    <div className="container">
      <h1>ABM Usuarios</h1>
      {err && <p className="error">{err}</p>}

      <form className="card" onSubmit={createUser} style={{maxWidth:520}}>
        <label className="label">Nombre</label>
        <input className="input" name="name" value={form.name} onChange={onChange} />

        <label className="label">Email</label>
        <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />

        <label className="label">Contraseña</label>
        <input className="input" name="password" type="password" value={form.password} onChange={onChange} required />

        <label className="label">Rol</label>
        <select className="input" name="role" value={form.role} onChange={onChange}>
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="super-admin">super-admin</option>
        </select>

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear'}
        </button>
      </form>

      <table className="table" style={{marginTop:24}}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th style={{width:280}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(u=>(
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name || '—'}</td>
              <td>{u.email}</td>
              <td><span className="badge">{u.role}</span></td>
              <td>
                <div className="row" style={{gap:8, flexWrap:'wrap'}}>
                  <button className="btn" onClick={()=>promote(u.id,'user')}>user</button>
                  <button className="btn" onClick={()=>promote(u.id,'admin')}>admin</button>
                  <button className="btn" onClick={()=>promote(u.id,'super-admin')}>super-admin</button>
                  <button className="btn danger" onClick={()=>removeUser(u.id)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={5}><p className="help">No hay usuarios.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}