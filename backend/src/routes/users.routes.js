import { Router } from 'express';
import bcrypt from 'bcrypt';
import { all, get, run } from '../config/db.js';
import authRequired from '../middleware/authRequired.js';
import roleRequired from '../middleware/roleRequired.js';

const router = Router();




// --------- MODULO CHECKEADO -------------//

/*NOTA:
user.routes a diferencia de orders.routes y product.routes, posee las consultas aca 
y no separadas en los modulos models (all, byID, etc)

*/





//cambiamos rol a nivel (numero como esta en la DB)
const roleToNivel = (r) => (r === 'super-admin' ? 3 : r === 'admin' ? 2 : 1);
//cambiamos nivel a rol (de db a backend)
const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');


//GET CHECKEADO
// este get es un puente entre user.js y UsersAdmin.jsx "/"
//listar usuarios desde userAdmin.jsx
router.get('/', authRequired, roleRequired('super-admin'), async (req, res) => {
  //en rows guardamos un select con todo lo del usuario
  const rows = await all(`
    SELECT Id AS id, Email AS email, Nombre AS name, Nivel
    FROM Usuarios
    ORDER BY Id DESC
  `);
//devolvemos un map de rows, cambiando nivel(dato interger en db) a rol (string) , y copiando lo que teniamos (...r) con spread operator
  res.json(rows.map(r => ({ ...r, role: nivelToRole(r.Nivel) })));
});




//POST CHECKEADO
//Crear un usuario desde UsersAdmin
router.post('/', authRequired, roleRequired('super-admin'), async (req, res) => {
  try {
    //en la constante guardamos el body de la request (los parametros enviados desde el front)
    //si no hay nada por defecto es vacio
    const { name = '', email = '', password = '', role = 'user' } = req.body || {};
    //validamos mail y password
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

    //guardamos en exists un select filtrado por mail del usuario
    const exists = await get(`SELECT Id FROM Usuarios WHERE Email = ?`, [email]);
    //si existe ya esta registrado
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    //si no existe hasheamos la contraseña
    const hash = await bcrypt.hash(String(password), 10);
    //guardamos en la constante el nivel del usuario para subirlo a la DB
    const nivel = roleToNivel(role);

    //hacemos run INSERT para insertarlo en la db y le pasamos los parametros
    const r = await run(
      `INSERT INTO Usuarios (Email, Password, Nombre, Apellido, Telefono, Direccion, Nivel)
      VALUES (?,?,?,?,?,?,?)`,
      [email, hash, name, '', '', '', nivel]
    );
    //devolvemos id, name, email y role en la respuesta
    res.json({ id: r.lastID, name, email, role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});




//PUT CHECKEADO 
//cambiar rol de un usuario
router.put('/:id/role', authRequired, roleRequired('super-admin'), async (req, res) => {
  //guardamos en la constante el rol del usuario enviado por request
  const { role } = req.body || {};
  //guaradmos en nivel el rol del usuario cambiado a integer
  const nivel = roleToNivel(role);
  //guardamos en la constante r el RUN UPDATE del usuario filtrado por nivel y por id
  const r = await run(`UPDATE Usuarios SET Nivel=? WHERE Id=?`, [nivel, req.params.id]);
  //si no hay cambios en alguna fila (changes), retorna usuario no encontrado
  if (!r.changes) return res.status(404).json({ message: 'Usuario no encontrado' });
  //si hay filas afectadas retorna ok true
  res.json({ ok: true });
});




//DELETE CHECKEADO
//borrar usuario
router.delete('/:id', authRequired, roleRequired('super-admin'), async (req, res) => {
  //en r guardamos el RUN DELETE, filtrado por el id del usuario, pasado por parametro (req)
  const r = await run(`DELETE FROM Usuarios WHERE Id=?`, [req.params.id]);
  //si no hay filas modificadas (!changes), retornamos usuario no encontrado
  if (!r.changes) return res.status(404).json({ message: 'Usuario no encontrado' });
  //si hay filas afectadas retornamos ok: true
  res.json({ ok: true });
});

export default router;