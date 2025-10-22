import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';


// --------- MODULO CHECKEADO-------------//






//funcion CHECKEADA
export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);




  //funcion CHECKEADA
  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      setLoading(true);
      //este login es de usecontext
      //pasamos email y password
      //desde authcontext le agregamos un token a ese usuario al pasarle email y password
      await login( email, password );
      //nav que usa useNavigate al home
      nav('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form className="card" onSubmit={submit} style={{ maxWidth: 480 }}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} required />

        <label className="label">Contraseña</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />

        {err && <p className="error">{err}</p>}
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="help" style={{marginTop:12}}>
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </form>
    </div>
  );
}