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

    const ids  = items.map(i => i.product_id);
    const rows = await all(
      `SELECT ProdId, Precio, Stock
         FROM Productos
        WHERE ProdId IN (${ids.map(()=>'?').join(',')})`,
      ids
    );
    if (rows.length !== ids.length) {
      return res.status(400).json({ message: 'Hay productos inexistentes en el carrito' });
    }
    const byId = Object.fromEntries(rows.map(r => [r.ProdId, r]));
    for (const it of items) {
      const pr = byId[it.product_id];
      if (!pr) return res.status(400).json({ message: `Producto #${it.product_id} no existe` });
      if (pr.Stock < it.qty) return res.status(400).json({ message: `Sin stock para #${it.product_id}` });
    }

    const total = items.reduce((s, it) => s + byId[it.product_id].Precio * it.qty, 0);

    await run('BEGIN');
    const ins = await run(
  `INSERT INTO Pedidos (Fecha, Monto, UsuarioId, Status) VALUES (?,?,?,?)`,
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

/** Listado admin con filtros (id de usuario o rango de fechas) */
router.get('/', authRequired, roleRequired('admin','super-admin'), async (req, res) => {
  const { q, from, to } = req.query;
  const params = [];
  let where = '1=1';
  if (q && /^\d+$/.test(q)) { where += ' AND p.UsuarioId = ?'; params.push(Number(q)); }
  if (from) { where += ' AND date(p.Fecha) >= date(?)'; params.push(from); }
  if (to)   { where += ' AND date(p.Fecha) <= date(?)'; params.push(to); }

  const rows = await all(
    `SELECT p.Id AS id, p.Fecha AS date, p.Monto AS total,
            p.UsuarioId AS user_id, p.Status AS status
       FROM Pedidos p
      WHERE ${where}
      ORDER BY p.Id DESC`, params
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

export default router;