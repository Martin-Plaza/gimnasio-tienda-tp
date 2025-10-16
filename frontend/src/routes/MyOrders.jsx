import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const fmtDate  = (s) => {
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleString('es-AR');
};
const fmtMoney = (n) => (isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`);

// Map de clases para que siempre se vea con color
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

export default function MyOrders(){
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/orders/mine');
        const fixed = data.map(o => ({
          id:     o.id ?? o.Id,
          date:   o.date ?? o.Fecha,
          total:  o.total ?? o.Monto,
          // usar || para cubrir string vacío
          status: (o.status || o.Status || 'pending')
        }));
        setRows(fixed);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-3">Mis Órdenes</h1>
      {err && <p className="text-danger">{err}</p>}

      {!rows.length ? (
        <p className="text-muted">No tenés órdenes todavía.</p>
      ) : (
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>N°</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o, idx) => (
              <tr key={o.id}>
                <td>#{idx + 1}</td>
                <td>{fmtDate(o.date)}</td>
                <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                <td>{fmtMoney(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}