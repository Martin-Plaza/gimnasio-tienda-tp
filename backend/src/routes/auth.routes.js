import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { get, run } from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';
import authRequired from '../middleware/authRequired.js';

const router = Router();

// helpers
const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');
const roleToNivel = (r) => (r === 'super-admin' ? 3 : r === 'admin' ? 2 : 1);
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

// ---------- REGISTER ----------
/**
 * POST /auth/register
 * body: { email, password, name?, role? }  // role opcional; por defecto "user"
 * Usa la tabla Usuarios con columnas: Id (PK), Email UNIQUE, Password, Nivel, Nombre, Apellido, Telefono, Direccion
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name = '', role = 'user' } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y password son obligatorios' });

    const exist = await get(`SELECT Id FROM Usuarios WHERE Email = ?`, [email]);
    if (exist) return res.status(409).json({ message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(String(password), 10);
    const nivel = roleToNivel(role);

    const r = await run(
      `INSERT INTO Usuarios (Email, Password, Nombre, Apellido, Telefono, Direccion, Nivel)
       VALUES (?,?,?,?,?,?,?)`,
      [email, hash, name, '', '', '', nivel]
    );

    const userId = r.lastID;
    const payload = { id: userId, email, role: nivelToRole(nivel), name };
    const token = signToken(payload);

    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- LOGIN ----------
/**
 * POST /auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email y password son obligatorios' });

    const row = await get(
      `SELECT Id, Email, Password, Nivel, Nombre
         FROM Usuarios
        WHERE Email = ?`,
      [email]
    );
    if (!row) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(String(password), row.Password || '');
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const role = nivelToRole(row.Nivel);
    const name = row.Nombre || row.Email?.split('@')[0] || 'user';
    const payload = { id: row.Id, email: row.Email, role, name };
    const token = signToken(payload);

    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- WHOAMI ----------
/**
 * GET /auth/whoami
 * header: Authorization: Bearer <token>
 */
router.get('/whoami', authRequired, async (req, res) => {
  // refrezcamos datos desde la DB por si cambió el nombre/rol
  const row = await get(`SELECT Id, Email, Nivel, Nombre FROM Usuarios WHERE Id=?`, [req.user.id]);
  if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
  const role = nivelToRole(row.Nivel);
  const name = row.Nombre || row.Email?.split('@')[0] || 'user';
  res.json({ id: row.Id, email: row.Email, role, name });
});

export default router;