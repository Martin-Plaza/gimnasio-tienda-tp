import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';


//----------SIN REVISAR----------//




//FUNCION CHECKEADA
//rolebadge devuelve el color del rol del usuario en usersAdmin, por defecto es role user, pero le pasamos role por parametros
const roleBadge = (role = 'user') => {
  const r = String(role).toLowerCase();
  if (r === 'super-admin') return 'badge rounded-pill text-bg-warning text-dark';
  if (r === 'admin')       return 'badge rounded-pill text-bg-info';
  return 'badge rounded-pill text-bg-secondary'; // user
};




//FUNCION SIN REVISAR
export default function UsersAdmin(){
  const { hasRole } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);





  //FUNCION CHECKEADA
  //cargamos todos los usuarios
  const load = async ()=>{
    //seteamos error a null
    setErr(null);
    try {
      //llamamos a la api /users, que es un get (select) de todos los usuarios en users.routes
      //lo guardamos en data
      const data = await api('/users');
      //hacemos un map de data (todos los usuarios) y lo guardamos en rows, para renderizado
      setRows(data.map(u => ({
        id:    u.id,
        name:  u.name,
        email: u.email,
        role:  u.role
      })));
    } catch(e) {
      setErr(e.message);
    }
  };



//USEFECT CHECKEADO
//luego de cargar el modulo corremos load
  useEffect(()=>{ load(); },[]);



  //FUNCION CHECKEADA
  //este onchange maneja todos los inputs
  //captura name y value del evento y setea el form, copiando ...f y sobreescribe el value
  const onChange = (e)=>{
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };



  //FUNCION CHECKEADA
  const createUser = async (e)=>{
    //captura el evento del boton createuser
    e.preventDefault();
    //seteamos el error a null
    setErr(null);
    //string de cargando
    setLoading(true);
    try{
      //si no es el rol indicado lanza un objeto error 
      if (!hasRole('super-admin')) throw new Error('Solo super-admin puede crear usuarios');
      //guardamos el payload un objeto con los value capturados en los inputs
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      };
      //guardamos en u la llamada a la api con metodo post
      const u = await api('/users', { method:'POST', body: JSON.stringify(payload) });
      //seteamos en rows
      //copiamos el usuario creado con spread operator (...rs)
      setRows(rs => [{ id:u.id, name:u.name, email:u.email, role:u.role }, ...rs]);
      //seteamos los campos de form a vacio
      setForm({ name:'', email:'', password:'', role:'user' });
    }catch(e){
      setErr(e.message || 'No se pudo crear el usuario');
    }finally{
      setLoading(false);
    }
  };







  //FUNCION CHECKEADA
  //le pasamos por parametro el id que queremos borrar
  const removeUser = async (id)=>{
    //si el rol no es el indicado retorna alert
    if (!hasRole('super-admin')) return alert('Solo super-admin');
    //si es superadmin envia modal
    const ok = window.confirm(`¿Eliminar usuario #${id}?`);
    if (!ok) return;
    try{
      //si es true el modal hace una llamada a la api /users/:id metodo delete
      await api(`/users/${id}`, { method:'DELETE' });
      //setea las filas (rows), filtrando todas las filas menos el que acabamos de borrar por id
      setRows(rs => rs.filter(r => r.id !== id));
    }catch(e){
      alert(e.message || 'Error al eliminar');
    }
  };





//FUNCION CHECKEADA
//promote cambia el rol del usuario
//le pasamos por parametro el id y el rol
  const promote = async (id, role)=>{
    //si no es el rol indicado retornamos alert
    if (!hasRole('super-admin')) return alert('Solo super-admin');
    try{
      //llamamos a la api /users/:id/role con metodo put, y le pasamos el rol
      await api(`/users/${id}/role`, { method:'PUT', body: JSON.stringify({ role }) });
      //seteamos el rol del usuario buscando por id, una vez que lo encontramos copiamos todo ese usuario con spread operator
      //y luego sobrescribimos role
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