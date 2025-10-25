import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'


//----------MODULO REVISADO ---------//


//FUNCION CHECKEADA
//protege las rutas por roles
export default function ProtectedRoute({ children }){
  //guardamos en la constante las funciones user, loading, hasrole
  const { user, loading} = useAuth()
  //si loading es true muestra cargando
  if(loading) return <p className="help" style={{padding:16}}>Cargando...</p>
  //si no hay sesion iniciada navega a login (en el caso de que quieras entrar a un lugar que necesite autenticacion)
  if(!user) return <Navigate to='/login' replace />
  //si todo es valido renderizamos el modulo children
  return children
}