import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token')||null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const init = async ()=>{
      try{
        if(!token){ localStorage.removeItem('token'); setUser(null); return }
        localStorage.setItem('token', token)
        const d = await api('/auth/me')
        setUser(d.user)
      }catch{ logout() }
      finally{ setLoading(false) }
    }
    init()
  }, [token])

  const login = async (email,password)=>{
    const d = await api('/auth/login',{method:'POST', body:JSON.stringify({email,password})})
    setToken(d.token); setUser(d.user); return d.user
  }
  const register = async (payload)=>{
    const d = await api('/auth/register',{method:'POST', body:JSON.stringify(payload)})
    setToken(d.token); setUser(d.user); return d.user
  }
  const logout = ()=>{ setToken(null); setUser(null); }

  const hasRole = (...roles)=> user && roles.includes(user.role)

  return <AuthContext.Provider value={{user,token,loading,login,register,logout,hasRole}}>
    {children}
  </AuthContext.Provider>
}