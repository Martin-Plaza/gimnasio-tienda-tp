import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { Products } from '../models/Product.js';

const router = Router();




// --------- MODULO CHECKEADO -------------//








//GET CHECKEADO
router.get('/', async (req,res)=>{
  try{
    //hacemos una llamada a todos los productos con un select desde product.js
    res.json(await Products.all());
  }catch(e){ res.status(500).json({ message:e.message }); }
});



//POST CHECKEADO
// Crear
router.post('/', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    //guardamos en la constante lo que viene del front en la request, desestructurado
    const { name, price, stock, image_url='', description='' } = req.body || {};
    //si alguno de los siguientes campos no existe retorna error
    if(!name || price===undefined || stock===undefined)
      return res.status(400).json({ message:'Faltan campos' });
    //si hay lo guardamos en p (parametros) y se lo pasamos a product.js y hacemos create
    const p = await Products.create({ name, price, stock, image_url, description });
    //devolvemos p como json al front
    res.json(p);
  }catch(e){ res.status(500).json({ message:e.message }); }
});





//PUT CHECKEADO
//Actualizar productos
router.put('/:id', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    //guardamos en p el id del parametro y el body, (que es payload de ProductsAdmin)
    //usamos metodo update a products.js
    const p = await Products.update(req.params.id, req.body||{});
    //si run de update en products.js no encuentra nada, es decir no guarda nada en p, retorna error
    if(!p) return res.status(404).json({message:'No encontrado'});
    //si encuentra retorna el update
    res.json(p);
  }catch(e){ res.status(500).json({ message:e.message }); }
});




//DELETE CHECKEADO
// Borrar
router.delete('/:id', authRequired, roleRequired('admin','super-admin'), async (req,res)=>{
  try{
    //llamamos a product.js metodo remove, y le pasamos el id que viene del front
    const ok = await Products.remove(req.params.id);
    //si ok no es true quiere decir que no encontro el producto (ok viene de product.js)
    if(!ok) return res.status(404).json({message:'No encontrado'});
    //si ok es true devuelve ese json al frontend
    res.json({ ok:true });
  }catch(e){ res.status(500).json({ message:e.message }); }
});

export default router;