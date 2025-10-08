import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register(){
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault(); setError(null)
    if(name.trim().length < 2) return setError('Nombre demasiado corto')
    if(!email.includes('@')) return setError('Email inválido')
    if(password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    try{
      await register({ name, email, password })
      navigate('/')
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