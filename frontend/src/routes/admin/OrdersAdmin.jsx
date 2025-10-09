// frontend/src/routes/admin/OrdersAdmin.jsx
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

export default function OrdersAdmin(){
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ user:'', dateFrom:'', dateTo:'' })

  const buildQuery = () => {
    const q = new URLSearchParams()
    const u = (filters.user || '').trim()
    if (u) q.set('user', u)                 // email parcial o id exacto
    if (filters.dateFrom) q.set('dateFrom', filters.dateFrom)
    if (filters.dateTo)   q.set('dateTo',   filters.dateTo)
    return q.toString()
  }

  const load = async () => {
    try{
      setLoading(true); setError(null)
      const qs = buildQuery()
      const data = await api(`/orders${qs ? `?${qs}` : ''}`)
      setOrders(data)
    }catch(e){ setError(e.message) }
    finally{ setLoading(false) }
  }

  const clearFilters = async (e) => {
    e?.preventDefault()
    setFilters({ user:'', dateFrom:'', dateTo:'' })
    try{
      setLoading(true); setError(null)
      const data = await api('/orders')
      setOrders(data)
    }catch(e){ setError(e.message) }
    finally{ setLoading(false) }
  }

  const changeStatus = async (id, status)=>{
    try{
      await api(`/orders/${id}/status`, { method:'PUT', body: JSON.stringify({ status })})
      load()
    }catch(e){ setError(e.message) }
  }

  useEffect(()=>{ clearFilters() },[]) // carga inicial (todas)

  return (
    <div>
      <h1>Órdenes</h1>

      <div className="card" style={{marginBottom:12}}>
        <div className="row">
          <div>
            <span className="label">Usuario (email parcial o id)</span>
            <input
              className="input"
              value={filters.user}
              onChange={e=>setFilters(f=>({...f,user:e.target.value}))}
              placeholder="user@gym.com o 3"
            />
          </div>
          <div>
            <span className="label">Desde</span>
            <input
              type="date"
              className="input"
              value={filters.dateFrom}
              onChange={e=>setFilters(f=>({...f,dateFrom:e.target.value}))}
            />
          </div>
          <div>
            <span className="label">Hasta</span>
            <input
              type="date"
              className="input"
              value={filters.dateTo}
              onChange={e=>setFilters(f=>({...f,dateTo:e.target.value}))}
            />
          </div>
          <div className="row" style={{alignItems:'flex-end'}}>
            <button className="btn" onClick={load}>Filtrar</button>
            <button className="btn" onClick={clearFilters}>Limpiar</button>
          </div>
        </div>
      </div>

      {loading && <p className="help">Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !orders.length && <p className="help">Sin resultados.</p>}

      {!!orders.length && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Usuario</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Acciones</th>
            </tr>
          </thead>
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
      )}
    </div>
  )
}