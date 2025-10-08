import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

export default function OrdersAdmin(){
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ user:'', dateFrom:'', dateTo:'' })

  const load = ()=>{
    const q = new URLSearchParams()
    if(filters.user) q.set('user', filters.user)
    if(filters.dateFrom) q.set('dateFrom', filters.dateFrom)
    if(filters.dateTo) q.set('dateTo', filters.dateTo)
    api(`/orders${q.toString() ? `?${q.toString()}` : ''}`)
      .then(setOrders)
      .catch(e=>setError(e.message))
  }
  useEffect(()=>{ load() },[]) // initial

  const changeStatus = async (id, status)=>{
    await api(`/orders/${id}/status`, { method:'PUT', body: JSON.stringify({ status })})
    load()
  }

  return (
    <div>
      <h1>Órdenes</h1>
      <div className="card" style={{marginBottom:12}}>
        <div className="row">
          <div><span className="label">Usuario (email o id)</span>
            <input className="input" value={filters.user} onChange={e=>setFilters(f=>({...f,user:e.target.value}))}/></div>
          <div><span className="label">Desde</span>
            <input type="date" className="input" value={filters.dateFrom} onChange={e=>setFilters(f=>({...f,dateFrom:e.target.value}))}/></div>
          <div><span className="label">Hasta</span>
            <input type="date" className="input" value={filters.dateTo} onChange={e=>setFilters(f=>({...f,dateTo:e.target.value}))}/></div>
          <div className="row" style={{alignItems:'flex-end'}}>
            <button className="btn" onClick={load}>Filtrar</button>
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead><tr><th>ID</th><th>Usuario</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Acciones</th></tr></thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.user_email || o.user_id}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td><span className="badge">{o.status}</span></td>
              <td>${Number(o.total).toFixed(2)}</td>
              <td className="row">
                {['pending','paid','shipped','canceled'].map(s=>(
                  <button key={s} className="btn" onClick={()=>changeStatus(o.id, s)}>{s}</button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}