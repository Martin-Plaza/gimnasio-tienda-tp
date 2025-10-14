import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const fmtDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleString('es-AR');
};
const fmtMoney = (n) => isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`;

export default function MyOrders(){
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(()=>{
    (async()=>{
      try {
        const data = await api('/orders/mine');
        console.log("RESPUESTA /orders/mine =>", data);
        // ✅ Asegurar nombres correctos desde backend
        const fixed = data.map(o => ({
          id: o.id ?? o.Id,
          date: o.date ?? o.Fecha,
          total: o.total ?? o.Monto,
          status: o.status ?? o.Status ?? '—'
        }));
        setRows(fixed);
      }
      catch(e){
        setErr(e.message);
      }
    })();
  },[]);

  return (
    <div className="container">
      <h1>Mis Órdenes</h1>
      {err && <p className="error">{err}</p>}
      {!rows.length ? (
        <p className="help">No tenés órdenes todavía.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Fecha</th><th>Estado</th><th>Total</th></tr>
          </thead>
          <tbody>
            {rows.map(o=>(
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{fmtDate(o.date)}</td>
                <td>{o.status}</td>
                <td>{fmtMoney(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}