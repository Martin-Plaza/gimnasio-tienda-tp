import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { Orders } from '../models/Order.js';
import { Users } from '../models/User.js';

const router = Router();

// crea orden (user logueado)
router.post('/', authRequired, (req,res)=>{
  const { items, address } = req.body || {};
  if(!Array.isArray(items) || !items.length) return res.status(400).json({message:'Sin items'});
  try{
    const o = Orders.create({ user_id:req.user.id, items, address: address||'' });
    res.json(o);
  }catch(e){ res.status(400).json({message:e.message}); }
});

// mis órdenes
router.get('/mine', authRequired, (req,res)=>{
  res.json(Orders.byUser(req.user.id));
});

// admin+: listado con filtros
router.get('/', authRequired, roleRequired('admin','super-admin'), (req,res)=>{
  const { user, dateFrom, dateTo } = req.query;
  let list = Orders.all();
  if(user){
    const u = Users.byEmail(user) || Users.byId(user);
    list = u ? list.filter(o=>o.user_id===u.id) : [];
    list = list.map(o=>({ ...o, user_email:u?.email || u?.id }));
  } else {
    list = list.map(o=>({ ...o, user_email: Users.byId(o.user_id)?.email }));
  }
  if(dateFrom) list = list.filter(o=> new Date(o.created_at) >= new Date(dateFrom));
  if(dateTo)   list = list.filter(o=> new Date(o.created_at) <= new Date(dateTo+'T23:59:59'));
  res.json(list);
});

// admin+: cambio de estado
router.put('/:id/status', authRequired, roleRequired('admin','super-admin'), (req,res)=>{
  const { status } = req.body || {};
  const allowed = ['pending','paid','shipped','canceled'];
  if(!allowed.includes(status)) return res.status(400).json({message:'Estado inválido'});
  const o = Orders.updateStatus(req.params.id, status);
  if(!o) return res.status(404).json({message:'No encontrado'});
  res.json(o);
});

export default router;