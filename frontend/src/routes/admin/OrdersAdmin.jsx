import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const fmtDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? 'Invalid Date' : d.toLocaleString('es-AR');
};
const fmtMoney = (n) => isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`;

export default function OrdersAdmin(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async ()=>{
    setErr(null);
    setLoading(true);
    try{
      const data = await api('/orders');
      // normalizar por si el backend devuelve mayúsculas
      const fixed = data.map(o => ({
        id: o.id ?? o.Id,
        user_id: o.user_id ?? o.UsuarioId,
        date: o.date ?? o.Fecha,
        status: o.status ?? o.Status,
        total: o.total ?? o.Monto,
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
      // refrescar fila localmente para UX rápida
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
      // quitar de la tabla sin recargar
      setRows(rs => rs.filter(r => r.id !== id));
    }catch(e){
      alert(e.message || 'No se pudo eliminar la orden');
    }
  };

  return (
    <div className="container">
      <h1>Órdenes</h1>
      {err && <p className="error">{err}</p>}
      {loading ? <p className="help">Cargando…</p> : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
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
                <td>#{o.id}</td>
                <td>{o.user_id}</td>
                <td>{fmtDate(o.date)}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>{fmtMoney(o.total)}</td>
                <td>
                  <div className="row" style={{gap:8, flexWrap:'wrap'}}>
                    <button className="btn" onClick={()=>setStatus(o.id,'pending')}>pending</button>
                    <button className="btn" onClick={()=>setStatus(o.id,'paid')}>paid</button>
                    <button className="btn" onClick={()=>setStatus(o.id,'shipped')}>shipped</button>
                    <button className="btn" onClick={()=>setStatus(o.id,'canceled')}>canceled</button>
                  </div>
                </td>
                <td>
                  <button className="btn danger" onClick={()=>removeOrder(o.id)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7}><p className="help">No hay órdenes.</p></td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}