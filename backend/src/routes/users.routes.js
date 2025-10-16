import { Router } from 'express';
import bcrypt from 'bcrypt';
import { all, get, run } from '../config/db.js';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';

const router = Router();

const roleToNivel = (r) => (r === 'super-admin' ? 3 : r === 'admin' ? 2 : 1);
const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');

/** LISTAR usuarios (admin o super-admin) */
router.get('/', authRequired, roleRequired('admin','super-admin'), async (req, res) => {
  const rows = await all(`
    SELECT Id AS id, Email AS email, Nombre AS name, Nivel
    FROM Usuarios
    ORDER BY Id DESC
  `);
  res.json(rows.map(r => ({ ...r, role: nivelToRole(r.Nivel) })));
});

/** CREAR usuario (solo super-admin) */
router.post('/', authRequired, roleRequired('super-admin'), async (req, res) => {
  try {
    const { name = '', email = '', password = '', role = 'user' } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

    const exists = await get(`SELECT Id FROM Usuarios WHERE Email = ?`, [email]);
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(String(password), 10);
    const nivel = roleToNivel(role);

    const r = await run(
      `INSERT INTO Usuarios (Email, Password, Nombre, Apellido, Telefono, Direccion, Nivel)
      VALUES (?,?,?,?,?,?,?)`,
      [email, hash, name, '', '', '', nivel]
    );

    res.json({ id: r.lastID, name, email, role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** CAMBIAR rol (solo super-admin) */
router.put('/:id/role', authRequired, roleRequired('super-admin'), async (req, res) => {
  const { role } = req.body || {};
  const nivel = roleToNivel(role);
  const r = await run(`UPDATE Usuarios SET Nivel=? WHERE Id=?`, [nivel, req.params.id]);
  if (!r.changes) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ ok: true });
});

/** BORRAR usuario (solo super-admin) */
router.delete('/:id', authRequired, roleRequired('super-admin'), async (req, res) => {
  const r = await run(`DELETE FROM Usuarios WHERE Id=?`, [req.params.id]);
  if (!r.changes) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ ok: true });
});

export default router;