import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function MyOrders(){
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{
    api('/orders/mine')
      .then(setOrders)
      .catch(e=>setError(e.message))
  },[])

  return (
    <div>
      <h1>Mis Órdenes</h1>
      {error && <p className="error">{error}</p>}
      {!orders.length && <p className="help">No tenés órdenes.</p>}
      {!!orders.length && (
        <table className="table">
          <thead><tr><th>ID</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>${Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}