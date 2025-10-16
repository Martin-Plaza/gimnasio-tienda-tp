import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const fmtDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleString('es-AR');
};
const fmtMoney = (n) => (isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`);

export default function MyOrders(){
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/orders/mine');
        const fixed = data.map(o => ({
          // guardamos id para key interna, pero NO lo mostramos
          id:     o.id ?? o.Id,
          date:   o.date ?? o.Fecha,
          total:  o.total ?? o.Monto,
          status: o.status ?? o.Status ?? '—',
        }));
        setRows(fixed);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="container">
      <h1>Mis Órdenes</h1>
      {err && <p className="error">{err}</p>}

      {!rows.length ? (
        <p className="help">No tenés órdenes todavía.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>N°</th> {/* <- si no querés numeración, borrá esta columna */}
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o, idx) => (
              <tr key={o.id}>
                <td>#{idx + 1}</td> {/* <- y esta celda */}
                <td>{fmtDate(o.date)}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>{fmtMoney(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}