import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ roles = [], children }){
  const { user, loading, hasRole } = useAuth()
  if(loading) return <p className="help" style={{padding:16}}>Cargando...</p>
  if(!user) return <Navigate to='/login' replace />
  if(roles.length && !hasRole(...roles)) return <Navigate to='/' replace />
  return children
}