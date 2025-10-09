import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.sample.js';
import { Users } from '../models/User.js';
import authRequired from '../middleware/authRequired.js';

const router = Router();

router.post('/login', (req,res)=>{
  const { email, password } = req.body || {};
  const u = Users.byEmail(email);
  if(!u || u.password !== password) return res.status(400).json({message:'Credenciales inválidas'});
  const token = jwt.sign({ id:u.id, role:u.role, name:u.name, email:u.email }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role } });
});

router.post('/register', (req,res)=>{
  const { name, email, password } = req.body || {};
  if(!name || !email || !password) return res.status(400).json({message:'Faltan campos'});
  try{
    const u = Users.create({ name,email,password,role:'user' });
    const token = jwt.sign({ id:u.id, role:u.role, name:u.name, email:u.email }, JWT_SECRET, { expiresIn:'7d' });
    res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role } });
  }catch(e){ res.status(400).json({message:e.message}); }
});

router.get('/me', authRequired, (req,res)=>{
  res.json({ user: { id:req.user.id, name:req.user.name, email:req.user.email, role:req.user.role } });
});

export default router;