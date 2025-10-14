import { all, get, run } from '../config/db.js';
import { Products } from './Product.js';

export const Orders = {
  all: async () => {
    return all(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id, 'pending' AS status
                FROM Pedidos ORDER BY Id DESC`);
  },
  byUser: async (uid) => {
    return all(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id, 'pending' AS status
                FROM Pedidos WHERE UsuarioId = ? ORDER BY Id DESC`, [uid]);
  },
  create: async ({ user_id, items, address='' }) => {
    const det = [];
    let total = 0;
    for (const it of items){
      const p = await Products.byId(it.product_id);
      if(!p) throw new Error(`Producto ${it.product_id} inexistente`);
      if(p.stock < it.qty) throw new Error(`Sin stock de ${p.name}`);
      det.push({ product_id:p.id, qty:Number(it.qty), price:Number(p.price) });
      total += Number(p.price) * Number(it.qty);
    }
    const now = new Date().toISOString();
    const r = await run(`INSERT INTO Pedidos (Fecha, Monto, UsuarioId) VALUES (?,?,?)`,
      [now, total, Number(user_id)]);
    const orderId = r.lastID;

    for (const d of det){
      await run(`INSERT INTO DetalleCompras (CompraId, ProdId, Cantidad) VALUES (?,?,?)`,
        [orderId, d.product_id, d.qty]);
      await run(`UPDATE Productos SET Stock = Stock - ? WHERE ProdId = ?`, [d.qty, d.product_id]);
    }

    return { id: orderId, user_id, items: det, total, status:'pending', created_at: now, address };
  },
  updateStatus: async (id, status) => {
    const o = await get(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id
                         FROM Pedidos WHERE Id=?`, [id]);
    if(!o) return null;
    return { ...o, status };
  }
};