import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { Products } from '../models/Product.js';

const router = Router();

// público (lista y detalle por ?id=)
router.get('/', (req,res)=>{
  const { id } = req.query;
  if(id){
    const p = Products.byId(id);
    return res.json(p ? [p] : []);
  }
  res.json(Products.all());
});

// admin+: ABM
router.post('/', authRequired, roleRequired('admin','super-admin'), (req,res)=>{
  const { name, price, stock, image_url } = req.body || {};
  if(!name || price===undefined || stock===undefined) return res.status(400).json({message:'Faltan campos'});
  const p = Products.create({ name, price, stock, image_url });
  res.json(p);
});

router.put('/:id', authRequired, roleRequired('admin','super-admin'), (req,res)=>{
  const p = Products.update(req.params.id, req.body||{});
  if(!p) return res.status(404).json({message:'No encontrado'});
  res.json(p);
});

router.delete('/:id', authRequired, roleRequired('admin','super-admin'), (req,res)=>{
  const ok = Products.remove(req.params.id);
  if(!ok) return res.status(404).json({message:'No encontrado'});
  res.json({ ok:true });
});

export default router;