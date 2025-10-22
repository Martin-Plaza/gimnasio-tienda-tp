import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';




//-------SIN REVISAR---------//




//FUNCION CHECKEADA
//convierte el parametro en Date, luego verifica si es NaN (isNaN retorna bool), si es, retorna _, si no es NaN, retorna la fecha en formato ARG.
const fmtDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? 'Invalid Date' : d.toLocaleString('es-AR');
};

//FUNCION CHECKEADA
////verifica si el parametro n es NaN, si es NaN retorna $0.00, sino n con toFixed.
const fmtMoney = (n) => (isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`);




// Case de clases para que siempre se vea con color, para el map del return
//s='' es parametro por defecto
const statusBadge = (s='') => {
  //hacemos switch para que actue distinto dependiendo de lo que venga del backend desde order.routes.js
  switch (s) {
    case 'paid':     return 'badge rounded-pill text-bg-success';
    case 'shipped':  return 'badge rounded-pill text-bg-info';
    case 'canceled': return 'badge rounded-pill text-bg-danger';
    case 'pending':
    default:         return 'badge rounded-pill text-bg-secondary';
  }
};



//FUNCION SIN REVISAR
export default function OrdersAdmin(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  


//FUNCION CHECKEADA
//la funcion load setea todas las filas haciendo llamada a la api de /orders
  const load = async ()=>{
    setErr(null);
    setLoading(true);
    try{
      //en data guardamos el get de /orders, proveniente de orders.routes, que es un json
      const data = await api('/orders');
      //mapeamos data dentro de la constante fixed
      const fixed = data.map(o => ({
        id:        o.id,
        user_id:   o.user_id,
        user_email:o.user_email,
        date:      o.date,
        status:    (o.status) || 'pending',
        total:     o.total,
      }));
      //seteamos rows con fixed
      setRows(fixed);
    }catch(e){
      setErr(e.message);
    }finally{
      setLoading(false);
    }
  };



  //USEEFECT CHECKEADO
  //cuando cargamos todo el modulo se ejecuta una vez load, como no especifica el methodo, es GET
  useEffect(()=>{ load(); },[]);




//FUNCION SIN REVISAR
  const setStatus = async (id, status)=>{
    try{
      await api(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setRows(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    }catch(e){
      alert(e.message || 'Error al actualizar estado');
    }
  };




//FUNCION SIN REVISAR
  const removeOrder = async (id)=>{
    const ok = window.confirm(`¿Eliminar la orden #${id}? Esta acción no se puede deshacer.`);
    if(!ok) return;
    try{
      await api(`/orders/${id}`, { method:'DELETE' });
      setRows(rs => rs.filter(r => r.id !== id));
    }catch(e){
      alert(e.message || 'No se pudo eliminar la orden');
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">Órdenes</h1>
      {err && <p className="text-danger">{err}</p>}
      {loading ? (
        <p className="text-muted">Cargando…</p>
      ) : (
        <table className="table table-striped align-middle">
          <thead className="table-light">
            <tr>
              {/* ID oculto visualmente */}
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
              <th style={{textAlign:'center'}}>Acciones</th>
              <th style={{width:110}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td>{o.user_email ?? `#${o.user_id}`}</td>
                <td>{fmtDate(o.date)}</td>
                <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                <td>{fmtMoney(o.total)}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={()=>setStatus(o.id,'pending')}>pending</button>
                    <button className="btn btn-outline-success btn-sm"   onClick={()=>setStatus(o.id,'paid')}>paid</button>
                    <button className="btn btn-outline-info btn-sm"      onClick={()=>setStatus(o.id,'shipped')}>shipped</button>
                    <button className="btn btn-outline-danger btn-sm"    onClick={()=>setStatus(o.id,'canceled')}>canceled</button>
                  </div>
                </td>
                <td className="text-end">
                  <button className="btn btn-danger btn-sm" onClick={()=>removeOrder(o.id)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6}><p className="text-muted mb-0">No hay órdenes.</p></td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
