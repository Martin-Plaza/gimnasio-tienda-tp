import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { all, run } from '../config/db.js';

const router = Router();




// --------- MODULO CHECKEADO -------------//






//POST CHECKEADO
//este post es la ruta de checkout (front) al create de Order.js
router.post('/', authRequired, async (req, res) => {
  //guardamos en userId el id del parametro de la request
  const userId  = req.user.id;
  //guardamos la direccion en adress, pregunta si hay adress, sino es vacio
  const address = (req.body?.address || '').trim();

  //pregunta si req.body.items es un arreglo, si es lo guarda en items, sino guarda arreglo vacio
  const items   = Array.isArray(req.body?.items) ? req.body.items : [];

  //validaciones de campo direccion y carrito
  if (!address) return res.status(400).json({ message: 'Falta dirección' });
  if (!items.length) return res.status(400).json({ message: 'Carrito vacío' });

  try {
          //si esta todo ok hace un RUN de insert, para order.js, y le pasamos los parametros
    await run(
      `INSERT OR IGNORE INTO Usuarios (Id, Nombre, Apellido, Telefono, Direccion, Nivel)
      VALUES (?,?,?,?,?, COALESCE((SELECT Nivel FROM Usuarios WHERE Id=?), 1))`,
      [userId, 'Auto', 'Creado', '', address, userId]
    );

// en ids guardamos un map de todos los id que estan en items
const ids = items.map(i => Number(i.product_id));
//guardamos en rows un arreglo con toda la consulta de todos los ids que guardamos para enviarlos al front
const rows = await all(
  `SELECT ProdId AS id, Precio AS price, Stock
    FROM Productos
    WHERE ProdId IN (${ids.map(() => '?').join(',')})`,
  ids
);

//covierte el arreglo de objetos "rows" en un solo objeto clave valor id - {objeto}
const byId = Object.fromEntries(rows.map(r => [r.id, r]));

// Validar productos
for (const it of items) {
  //busca por iteracion si el objeto existe y si hay stock
  const pr = byId[Number(it.product_id)];
  if (!pr) {
    return res.status(400).json({ message: `El producto ${it.product_id} no existe o fue eliminado` });
  }
  if (pr.Stock < it.qty) {
    return res.status(400).json({ message: `No hay stock suficiente para ${it.product_id}` });
  }
}

// Calcula total 
const total = items.reduce((s, it) => {
  const pr = byId[it.product_id];
  return s + (pr.price * it.qty);
}, 0);

// iniciamos la transaccion con begin para la insercion
await run('BEGIN');
//guardamos en ins el insert de la orden
const ins = await run(
  `INSERT INTO Pedidos (Fecha, Monto, UsuarioId, Status)
  VALUES (?,?,?,?)`,
  [new Date().toISOString(), total, userId, 'pending']
);
const orderId = ins.lastID;

    //hacemos update del stock
    for (const it of items) {
      await run(`UPDATE Productos SET Stock = Stock - ? WHERE ProdId = ?`,
        [it.qty, it.product_id]);
    }
    //comiteamos todo
    await run('COMMIT');
    //devolvemos la respuesta con ok, orderId y total
    res.json({ ok:true, orderId, total });
  } catch (e) {
    //si hay problemas hacemos rollback a begin
    try { await run('ROLLBACK'); } catch {}
    console.error('POST /orders error:', e);
    res.status(500).json({ message: e.message });
  }
});




//GET CHECKEADO
//este get es de myOrders.jsx
//guardamos en rows un select del pedido, filtrando por usuario
router.get('/mine', authRequired, async (req, res) => {
  const rows = await all(
    `SELECT p.Id AS id, p.Fecha AS date, p.Monto AS total, p.Status AS status
      FROM Pedidos p
      WHERE p.UsuarioId = ?
      ORDER BY p.Id DESC`, [req.user.id]
  );
  //devuelve rows
  res.json(rows);
});




//GETCHECKEADO
//hacemos un get a /orders, y esta api es llamada desde OrdersAdmin
//para ejecutarse la promesa requiere los midleware autenticacion y rol (authRequired y roleRequired)
router.get('/', authRequired, roleRequired('admin','super-admin'), async (req, res) => {

  // en rows guardaremos la consulta de la funcion sincronica all, proveniente de db.js
  const rows = await all(
    `SELECT
        p.Id        AS id,
        p.UsuarioId AS user_id,
        u.Email     AS user_email,
        p.Fecha     AS date,
        p.Status    AS status,
        p.Monto     AS total
    FROM Pedidos p
    LEFT JOIN Usuarios u ON u.Id = p.UsuarioId
    ORDER BY p.Id DESC`
  );
  
  res.json(rows);
});

//PUT CHECKEADO
//PUT que ejecuta ordersAdmin
router.put('/:id/status',
//para ejecutarse la promesa requiere los midleware autenticacion y rol (authRequired y roleRequired)
  authRequired, roleRequired('admin','super-admin'),
  async (req,res) => {
    //desestructura en la constante el body de la request y guarda status en la constante
    const { status } = req.body || {};
    //guardamos en allowed los 4 estados
    const allowed = ['pending','paid','shipped','canceled'];
    //si allowed NO incluye status hay error
    if (!allowed.includes(status)) return res.status(400).json({message:'Estado inválido'});
    //guardamos en r update del pedido usando de parametro el status y el id
    const r = await run(`UPDATE Pedidos SET Status=? WHERE Id=?`, [status, req.params.id]);
    //si no hay fila afectada (changes) arroja error de fija no encontrada
    if (!r.changes) return res.status(404).json({message:'Orden no encontrada'});
    //si encuentra ok es true
    res.json({ ok:true });
  }
);



//DELETE CHECKEADO
//este delete lo utilizamos en ordersAdmin.jsx
router.delete('/:id',
  //para ejecutarse la promesa requiere los midleware autenticacion y rol (authRequired y roleRequired)
  authRequired, roleRequired('admin','super-admin'),
  async (req, res) => {
    //guardamos en la constante id el parametro de id que viene desde el front
    const id = Number(req.params.id);
    //preguntamos con un booleano si es number, sino retorna status 400
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID inválido' });

    try {
      //hace un run para la transaccion
      await run('BEGIN');
      //borramos detalleCompras haciendo filtrando con el id
      await run(`DELETE FROM DetalleCompras WHERE CompraId = ?`, [id]);
      //guardamos en r la operacion delete
      const r = await run(`DELETE FROM Pedidos WHERE Id = ?`, [id]);
      //comiteamos todo
      await run('COMMIT');
      //si ninguna fila fue afectada (!changes), no se encontro la orden
      if (!r.changes) return res.status(404).json({ message: 'Orden no encontrada' });
      //retornamos ok:true si todo salio bien.
      return res.json({ ok: true });
    } catch (e) {
      try { await run('ROLLBACK'); } catch {}
      console.error('DELETE /orders/:id error:', e);
      return res.status(500).json({ message: e.message });
    }
  }
);

export default router;