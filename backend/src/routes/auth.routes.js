import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.sample.js';
import authRequired from '../middleware/authRequired.js';

const router = Router();

// Usuarios DEMO en memoria (para probar roles)
const usersMem = [
  { id: 1, name: 'Super', email: 'super@admin.com', role: 'super-admin', password: '123456' },
  { id: 2, name: 'Admin', email: 'admin@gym.com',   role: 'admin',       password: '123456' },
  { id: 3, name: 'User',  email: 'user@gym.com',    role: 'user',        password: '123456' },
];

router.post('/login', (req,res)=>{
  const { email, password } = req.body || {};
  const u = usersMem.find(x => x.email === email);
  if(!u || u.password !== password) return res.status(400).json({message:'Credenciales inválidas'});
  const token = jwt.sign({ id:u.id, role:u.role, name:u.name, email:u.email }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role } });
});

router.post('/register', (req,res)=>{
  const { name, email, password } = req.body || {};
  if(!name || !email || !password) return res.status(400).json({message:'Faltan campos'});
  if(usersMem.some(u=>u.email===email)) return res.status(400).json({message:'Email ya registrado'});
  const id = usersMem.at(-1).id + 1;
  const u = { id, name, email, password, role:'user' };
  usersMem.push(u);
  const token = jwt.sign({ id:u.id, role:u.role, name:u.name, email:u.email }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role } });
});

router.get('/me', authRequired, (req,res)=>{
  res.json({ user: { id:req.user.id, name:req.user.name, email:req.user.email, role:req.user.role } });
});

export default router;