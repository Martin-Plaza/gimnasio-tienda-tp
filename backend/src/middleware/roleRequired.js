import { get } from '../config/db.js';

//guardamos el string del usuario por su rol
const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');

//autenticamos el rol del usuario. allowedroles es un arreglo con los parametros que le pasemos
//por eso esta con spread operator
export default function roleRequired(...roles) {
  //pasamos request, respuesta y midleware siguiente (next)
  return async (req, res, next) => {
    try {
      //si no hay id del usuario en la request, retornamos unauthorized
      if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

      //guardamos en row el select filtrado por el usuario, y le pasamos el parametro
      const row = await get(`SELECT Nivel FROM Usuarios WHERE Id = ?`, [req.user.id]);
      //si no se guardo nada, quiere decir que no encontro nada
      if (!row) return res.status(401).json({ message: 'Usuario no encontrado' });
      //guardamos el rol del usuario (el string)
      const role = nivelToRole(row.Nivel);

      //guardamos en can un booleano de includes, en este verificamos (cuando le pasamos el rol) cual es
      //si es superadmin tiene poder de superadmin, admin y usuario
      const can =
        role === 'super-admin'
          ? roles.includes('super-admin') || roles.includes('admin') || roles.includes('user')
                //si es admin tiene poder de admin, admin y usuario
          : role === 'admin'
            ? roles.includes('admin') || roles.includes('user')
                  //si es usuario, solo tiene poder de usuario
            : roles.includes('user') || roles.length === 0;

      if (!can) return res.status(403).json({ message: 'Forbidden' });
      //pasamos al siguiente midleware con next
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}