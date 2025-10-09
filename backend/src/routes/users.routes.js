import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { Users } from '../models/User.js';

const router = Router();

// SUPER-ADMIN: ABM usuarios
router.get('/', authRequired, roleRequired('super-admin'), (req,res)=> res.json(Users.all()));

router.post('/', authRequired, roleRequired('super-admin'), (req,res)=>{
  try{
    const { name,email,password,role='user' } = req.body || {};
    if(!name || !email || !password) return res.status(400).json({message:'Faltan campos'});
    const u = Users.create({ name,email,password,role });
    res.json({ id:u.id, name:u.name, email:u.email, role:u.role });
  }catch(e){ res.status(400).json({message:e.message}); }
});

router.put('/:id', authRequired, roleRequired('super-admin'), (req,res)=>{
  const u = Users.update(req.params.id, req.body||{});
  if(!u) return res.status(404).json({message:'No encontrado'});
  res.json({ id:u.id, name:u.name, email:u.email, role:u.role });
});

router.delete('/:id', authRequired, roleRequired('super-admin'), (req,res)=>{
  const ok = Users.remove(req.params.id);
  if(!ok) return res.status(404).json({message:'No encontrado'});
  res.json({ ok:true });
});

export default router;