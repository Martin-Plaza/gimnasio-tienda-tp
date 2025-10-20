import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './routes/Home.jsx'
import Cart from './routes/Cart.jsx'
import Checkout from './routes/Checkout.jsx'
import MyOrders from './routes/MyOrders.jsx'
import Login from './routes/Login.jsx'
import Register from './routes/Register.jsx'
import ProductsAdmin from './routes/admin/ProductsAdmin.jsx'
import OrdersAdmin from './routes/admin/OrdersAdmin.jsx'
import UsersAdmin from './routes/admin/UsersAdmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export default function App(){
  return (
    //authProvider es de authcontext, provee un contexto a todas las rutas establecidas dentro de el
    <AuthProvider>
    {/*Navbar esta fuera de Routes, que significa que se va a renderizar en todas las rutas tmb.*/}
      <Navbar />
      <div className="container">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/carrito' element={<Cart />} />
          <Route path='/checkout' element={
            <ProtectedRoute><Checkout/></ProtectedRoute>
          }/>
          <Route path='/mis-ordenes' element={
            <ProtectedRoute roles={["user","admin","super-admin"]}><MyOrders/></ProtectedRoute>
          }/>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route path='/admin/productos' element={
            <ProtectedRoute roles={["admin","super-admin"]}><ProductsAdmin/></ProtectedRoute>
          }/>
          <Route path='/admin/ordenes' element={
            <ProtectedRoute roles={["admin","super-admin"]}><OrdersAdmin/></ProtectedRoute>
          }/>
          <Route path='/admin/usuarios' element={
            <ProtectedRoute roles={["super-admin"]}><UsersAdmin/></ProtectedRoute>
          }/>

          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}