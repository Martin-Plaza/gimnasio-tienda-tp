import { Router } from 'express';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';
import { all, run } from '../config/db.js';

const router = Router();

/** Crear pedido (desde Checkout) */
router.post('/', authRequired, async (req, res) => {
  const userId  = req.user.id;
  const address = (req.body?.address || '').trim();
  const items   = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!address) return res.status(400).json({ message: 'Falta dirección' });
  if (!items.length) return res.status(400).json({ message: 'Carrito vacío' });

  try {
    // Asegurar usuario en tabla Usuarios (Nivel numérico: 1 user)
    await run(
      `INSERT OR IGNORE INTO Usuarios (Id, Nombre, Apellido, Telefono, Direccion, Nivel)
       VALUES (?,?,?,?,?, COALESCE((SELECT Nivel FROM Usuarios WHERE Id=?), 1))`,
      [userId, 'Auto', 'Creado', '', address, userId]
    );

// Obtener todos los productos reales por ID
const ids = items.map(i => Number(i.product_id));
const rows = await all(
  `SELECT ProdId AS id, Precio AS price, Stock
     FROM Productos
    WHERE ProdId IN (${ids.map(() => '?').join(',')})`,
  ids
);

// Convertir lista a mapa por id
const byId = Object.fromEntries(rows.map(r => [r.id, r]));

// Validar productos
for (const it of items) {
  const pr = byId[Number(it.product_id)];
  if (!pr) {
    return res.status(400).json({ message: `El producto ${it.product_id} no existe o fue eliminado` });
  }
  if (pr.Stock < it.qty) {
    return res.status(400).json({ message: `No hay stock suficiente para ${it.product_id}` });
  }
}

// Calcular total (usar price, no Precio)
const total = items.reduce((s, it) => {
  const pr = byId[it.product_id];
  return s + (pr.price * it.qty);
}, 0);

// INSERT pedido
await run('BEGIN');
const ins = await run(
  `INSERT INTO Pedidos (Fecha, Monto, UsuarioId, Status)
   VALUES (?,?,?,?)`,
  [new Date().toISOString(), total, userId, 'pending']
);
const orderId = ins.lastID;

    for (const it of items) {
      await run(
        `INSERT INTO DetalleCompras (CompraId, ProdId, Cantidad) VALUES (?,?,?)`,
        [orderId, it.product_id, it.qty]
      );
      await run(`UPDATE Productos SET Stock = Stock - ? WHERE ProdId = ?`,
        [it.qty, it.product_id]);
    }
    await run('COMMIT');

    res.json({ ok:true, orderId, total });
  } catch (e) {
    try { await run('ROLLBACK'); } catch {}
    console.error('POST /orders error:', e);
    res.status(500).json({ message: e.message });
  }
});

/** Mis órdenes (usuario logueado) */
router.get('/mine', authRequired, async (req, res) => {
  const rows = await all(
    `SELECT p.Id AS id, p.Fecha AS date, p.Monto AS total, p.Status AS status
       FROM Pedidos p
      WHERE p.UsuarioId = ?
      ORDER BY p.Id DESC`, [req.user.id]
  );
  res.json(rows);
});

// Listado admin con email del usuario (y filtros)
router.get('/', authRequired, roleRequired('admin','super-admin'), async (req, res) => {
  const { q, from, to } = req.query;

  const params = [];
  let where = '1=1';

  // Filtro por usuario (id o email)
  if (q) {
    if (/^\d+$/.test(q)) {           // si es número: por UsuarioId
      where += ' AND p.UsuarioId = ?';
      params.push(Number(q));
    } else {                         // si es texto: por Email
      where += ' AND u.Email LIKE ?';
      params.push(`%${q}%`);
    }
  }

  // Filtros de fecha (ISO yyyy-mm-dd)
  if (from) { where += ' AND date(p.Fecha) >= date(?)'; params.push(from); }
  if (to)   { where += ' AND date(p.Fecha) <= date(?)'; params.push(to);   }

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
     WHERE ${where}
     ORDER BY p.Id DESC`,
    params
  );

  res.json(rows);
});

router.put('/:id/status',
  authRequired, roleRequired('admin','super-admin'),
  async (req,res) => {
    const { status } = req.body || {};
    const allowed = ['pending','paid','shipped','canceled'];
    if (!allowed.includes(status)) return res.status(400).json({message:'Estado inválido'});
    const r = await run(`UPDATE Pedidos SET Status=? WHERE Id=?`, [status, req.params.id]);
    if (!r.changes) return res.status(404).json({message:'Orden no encontrada'});
    res.json({ ok:true });
  }
);

router.delete('/:id',
  authRequired, roleRequired('admin','super-admin'),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'ID inválido' });

    try {
      await run('BEGIN');
      // Borrar primero el detalle para respetar FK lógicas
      await run(`DELETE FROM DetalleCompras WHERE CompraId = ?`, [id]);
      const r = await run(`DELETE FROM Pedidos WHERE Id = ?`, [id]);
      await run('COMMIT');

      if (!r.changes) return res.status(404).json({ message: 'Orden no encontrada' });
      return res.json({ ok: true });
    } catch (e) {
      try { await run('ROLLBACK'); } catch {}
      console.error('DELETE /orders/:id error:', e);
      return res.status(500).json({ message: e.message });
    }
  }
);

export default router;