import { all, get, run } from '../config/db.js';
import { Products } from './Product.js';






/*-----------MODULO CHECKEADO-------------*/









//objeto ORDER CHECKEADO
//importamos de db.js all, get, run
export const Orders = {

  
  all: async () => {
    //si llamamos a all, devuelve un select con todo
    return all(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id, 'pending' AS status
                FROM Pedidos ORDER BY Id DESC`);
  },






  //si llamamos a byuser, retorna all pero filtrado por el id
  byUser: async (uid) => {
    return all(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id, 'pending' AS status
                FROM Pedidos WHERE UsuarioId = ? ORDER BY Id DESC`, [uid]);
  },





  
  //CREATE CHECKEADO
  //le pasamos por parametro id, items, y adress (si no hay default es vacio)
  create: async ({ user_id, items, address='' }) => {
    //creamos un arreglo vacio
    const det = [];
    let total = 0;
    //iteramos en todos los items (items es un arreglo)
    for (const it of items){
      //en p guardamos consulta a products.byid(funcion all de product), pasando cada iteracion
      const p = await Products.byId(it.product_id);
      //si en alguna iteracion no existe p, es decir la consulta no trae nada, quiere decir que no existe
      if(!p) throw new Error(`Producto ${it.product_id} inexistente`);
      //tambien si el stock de p es menor a la cantidad que le pasamos, entonces hay error
      if(p.stock < it.qty) throw new Error(`Sin stock de ${p.name}`);

      //push agrega un elemento al final del arreglo, en este caso, vamos agregando en cada iteracion
      det.push({ product_id:p.id, qty:Number(it.qty), price:Number(p.price) });
      total += Number(p.price) * Number(it.qty);
    }
    //guardamos la fecha actual
    const now = new Date().toISOString();
    //en r guardamos el insert a pedidos y le pasamos los parametros obtenidos
    const r = await run(`INSERT INTO Pedidos (Fecha, Monto, UsuarioId) VALUES (?,?,?)`,
      [now, total, Number(user_id)]);
      //guardamos el ultimo id insertado
    const orderId = r.lastID;

    for (const d of det){
      //actualizamos stock de cada producto
      await run(`UPDATE Productos SET Stock = Stock - ? WHERE ProdId = ?`, [d.qty, d.product_id]);
    }
    //retornamos objeto con todo
    return { id: orderId, user_id, items: det, total, status:'pending', created_at: now, address };
  },





  

  //STATUS CHECKEADO
  //actualizamos status, traemos con parametro id y status
  updateStatus: async (id, status) => {
    //guardamos en o el select del pedido filtrando por ID
    const o = await get(`SELECT Id AS id, Fecha AS created_at, Monto AS total, UsuarioId AS user_id
                        FROM Pedidos WHERE Id=?`, [id]);
    //si no encuentra retorna null
    if(!o) return null;
    //si encuentra copia toda lo que hay en la consulta y sobreescribe status
    return { ...o, status };
  }
};