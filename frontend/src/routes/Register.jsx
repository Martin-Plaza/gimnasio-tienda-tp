import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'



//----------MODULO CHECKEADO----------//



//FUNCION CHECKEADA
export default function Register(){
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()




  //FUNCION CHECKEADA
  const submit = async (e)=>{
    //seteamos el error a null, es decir no hay error
    e.preventDefault(); setError(null)
    //preguntamos si nombre una longitud menos de 2 hay error
    //si el mail no incluye '@' tambien hay error
    //si el password es mas corto que 6 caracteres tambien hay error
    if(name.trim().length < 2) return setError('Nombre demasiado corto')
    if(!email.includes('@')) return setError('Email inválido')
    if(password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    try{
      //si esta todo bien llama a la funcion asincronica register, y le pasamos de parametros name, email, password
      //esta funcion viene de authContext.jsx
      await register({ name, email, password })
      //una vez registrados volvemos a home con '/' 
      navigate('/')
     
    //si algo sale mal el catch captura el error que ocurrió en los Ifs anteriores
    }catch(e){ setError(e.message) }
  }



  
  return (
    <div style={{maxWidth:420}}>
      <h1>Registro</h1>
      <form onSubmit={submit} className="card">
        <label className="label">Nombre</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} required/>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <label className="label">Contraseña</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        {error && <p className="error">{error}</p>}
        <button className="btn primary">Crear cuenta</button>
        <p className="help">¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></p>
      </form>
    </div>
  )
}