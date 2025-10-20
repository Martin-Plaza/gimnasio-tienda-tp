import { useEffect, useState } from 'react';
import { api } from '../services/api.js';



// --------- CHECKEADO -------------//



const fmtDate  = (s) => {
  //convierte el parametro en Date, luego verifica si es NaN (isNaN retorna bool), si es, retorna _, si no es NaN, retorna la fecha en formato ARG.
  const d = new Date(s);
  return isNaN(d) ? '—' : d.toLocaleString('es-AR');
};

//verifica si el parametro n es NaN, si es NaN retorna $0.00, sino n con toFixed.
const fmtMoney = (n) => (isNaN(Number(n)) ? '$0.00' : `$${Number(n).toFixed(2)}`);



// Map de clases para que siempre se vea con color
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



export default function MyOrders(){
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        //orders/mine es de orders.routes

        const data = await api('/orders/mine');
        //en fixed guardamos un map de data(el json que vino desde la api)
        //y en rows guardamos fixed, para que luego se renderice con otro map en el return
        const fixed = data.map(o => ({
          id:     o.id,
          date:   o.date,
          total:  o.total,
          // usar || para cubrir string vacío
          status: (o.status || 'pendiente')
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