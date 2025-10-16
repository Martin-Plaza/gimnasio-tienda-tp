import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const fmtDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? 'Invalid Date' : d.toLocaleString('es-AR');
};
const fmtMoney = (n) => (isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`);

// badge con color por estado
const statusBadge = (s='') => {
  const k = String(s).toLowerCase();
  switch (k) {
    case 'paid':     return 'badge rounded-pill text-bg-success';
    case 'shipped':  return 'badge rounded-pill text-bg-info';
    case 'canceled': return 'badge rounded-pill text-bg-danger';
    case 'pending':
    default:         return 'badge rounded-pill text-bg-secondary';
  }
};

export default function OrdersAdmin(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async ()=>{
    setErr(null);
    setLoading(true);
    try{
      const data = await api('/orders');
      const fixed = data.map(o => ({
        id:        o.id ?? o.Id,
        user_id:   o.user_id ?? o.UsuarioId,
        user_email:o.user_email ?? o.Email ?? o.email ?? null,
        date:      o.date ?? o.Fecha,
        status:    (o.status ?? o.Status) || 'pending',
        total:     o.total ?? o.Monto,
      }));
      setRows(fixed);
    }catch(e){
      setErr(e.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

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
