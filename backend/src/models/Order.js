import { Products } from './Product.js';

export const ordersMem = []; // {id,user_id,items:[{product_id,qty,price}],total,status,created_at,address}
let nextOrderId = 1;

export const Orders = {
  all: () => ordersMem,
  byUser: (uid) => ordersMem.filter(o=>o.user_id===Number(uid)),
  create: ({ user_id, items, address }) => {
    // calcular precios/total en server
    const det = items.map(it=>{
      const p = Products.byId(it.product_id);
      if(!p) throw new Error(`Producto ${it.product_id} inexistente`);
      if(p.stock < it.qty) throw new Error(`Sin stock de ${p.name}`);
      return { product_id:p.id, qty:Number(it.qty), price:Number(p.price) };
    });
    const total = det.reduce((a,i)=>a+i.qty*i.price,0);
    // descontar stock (demo)
    det.forEach(i=>{
      const p = Products.byId(i.product_id);
      p.stock -= i.qty;
    });
    const o = { id: nextOrderId++, user_id:Number(user_id), items:det, total, status:'pending', created_at:new Date().toISOString(), address };
    ordersMem.push(o);
    return o;
  },
  updateStatus: (id, status) => {
    const o = ordersMem.find(x=>x.id===Number(id));
    if(!o) return null;
    o.status = status; return o;
  }
};