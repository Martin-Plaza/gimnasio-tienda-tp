import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { Products } from '../models/Product.js';

const router = Router();

// Listar
router.get('/', async (req,res)=>{
  try{
    const { id } = req.query;
    if (id) return res.json([await Products.byId(id)].filter(Boolean));
    res.json(await Products.all());
  }catch(e){ res.status(500).json({ message:e.message }); }
});

// Crear  ⬅️ REQUIERE admin o super-admin
router.post('/', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    const { name, price, stock, image_url='', description='' } = req.body || {};
    if(!name || price===undefined || stock===undefined)
      return res.status(400).json({ message:'Faltan campos' });
    const p = await Products.create({ name, price, stock, image_url, description });
    res.json(p);
  }catch(e){ res.status(500).json({ message:e.message }); }
});

// Actualizar
router.put('/:id', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    const p = await Products.update(req.params.id, req.body||{});
    if(!p) return res.status(404).json({message:'No encontrado'});
    res.json(p);
  }catch(e){ res.status(500).json({ message:e.message }); }
});

// Borrar
router.delete('/:id', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    const ok = await Products.remove(req.params.id);
    if(!ok) return res.status(404).json({message:'No encontrado'});
    res.json({ ok:true });
  }catch(e){ res.status(500).json({ message:e.message }); }
});

export default router;