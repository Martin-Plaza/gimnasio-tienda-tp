import { get } from '../config/db.js';

const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');

export default function roleRequired(...allowedRoles) {
  const wants = allowedRoles.map(r => String(r).toLowerCase());
  return async (req, res, next) => {
    try {
      if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

      // Leer rol real desde la DB (siempre fresco)
      const row = await get(`SELECT Nivel FROM Usuarios WHERE Id = ?`, [req.user.id]);
      if (!row) return res.status(401).json({ message: 'Usuario no encontrado' });
      const role = nivelToRole(row.Nivel).toLowerCase();

      // Jerarquía: super-admin ≥ admin ≥ user
      const can =
        role === 'super-admin'
          ? wants.includes('super-admin') || wants.includes('admin') || wants.includes('user')
          : role === 'admin'
            ? wants.includes('admin') || wants.includes('user')
            : wants.includes('user') || wants.length === 0;

      if (!can) return res.status(403).json({ message: 'Forbidden' });

      // opcional: exponer el rol real por si lo querés usar después
      req.user.role = role;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}