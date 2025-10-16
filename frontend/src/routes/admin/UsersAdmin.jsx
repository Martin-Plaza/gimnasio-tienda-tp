import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const roleBadge = (role = 'user') => {
  const r = String(role).toLowerCase();
  if (r === 'super-admin') return 'badge rounded-pill text-bg-warning text-dark';
  if (r === 'admin')       return 'badge rounded-pill text-bg-info';
  return 'badge rounded-pill text-bg-secondary'; // user
};

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
        id:    u.id ?? u.Id,
        name:  u.name ?? u.Nombre,
        email: u.email ?? u.Email,
        role:  u.role ?? u.Rol ?? u.Nivel
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
      if (!hasRole('super-admin')) throw new Error('Solo super-admin puede crear usuarios');
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
    <div className="container py-4">
      <h1 className="mb-3">ABM Usuarios</h1>
      {err && <p className="text-danger">{err}</p>}

      {/* Formulario de creación */}
      <form className="card shadow-sm mb-4" onSubmit={createUser} style={{maxWidth: 560}}>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="name" value={form.name} onChange={onChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" name="email" type="email" value={form.email} onChange={onChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input className="form-control" name="password" type="password" value={form.password} onChange={onChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select className="form-select" name="role" value={form.role} onChange={onChange}>
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super-admin">super-admin</option>
            </select>
          </div>

          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </form>

      {/* Tabla */}
      <table className="table table-striped align-middle">
        <thead className="table-light">
          <tr>
            <th style={{width:80}}>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th style={{width:140}}>Rol</th>
            <th style={{width:260}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(u=>(
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name || '—'}</td>
              <td>{u.email}</td>
              <td><span className={roleBadge(u.role)}>{u.role}</span></td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  {/* Dropdown Cambiar rol */}
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Cambiar rol
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={()=>promote(u.id,'user')}>user</button></li>
                      <li><button className="dropdown-item" onClick={()=>promote(u.id,'admin')}>admin</button></li>
                      <li><button className="dropdown-item" onClick={()=>promote(u.id,'super-admin')}>super-admin</button></li>
                    </ul>
                  </div>

                  {/* Eliminar */}
                  <button className="btn btn-danger btn-sm" onClick={()=>removeUser(u.id)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={5}><p className="text-muted mb-0">No hay usuarios.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}