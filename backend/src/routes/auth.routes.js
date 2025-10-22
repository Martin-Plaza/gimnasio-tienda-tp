import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { get, run } from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';
import authRequired from '../middleware/authRequired.js';

const router = Router();





// --------- REVISION EN PROCESO -------------//




// helpers
const nivelToRole = (n) => (n == 3 ? 'super-admin' : n == 2 ? 'admin' : 'user');
const roleToNivel = (r) => (r === 'super-admin' ? 3 : r === 'admin' ? 2 : 1);
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });






//ruta de register con metodo POST (crear un nuevo usuario en la DB)
router.post('/register', async (req, res) => {
  try {
    //guardamos en la constante con los datos del usuario destructurado "{ }"
    const { email, password, name = '', role = 'user' } = req.body;
    //verificamos que haya email o password
    if (!email || !password) return res.status(400).json({ message: 'Email y password son obligatorios' });

    //guardamos en exist una consulta a la DB (en el where email =? hacemos un filtrado con la dependencia [email])
    const exist = await get(`SELECT Id FROM Usuarios WHERE Email = ?`, [email]);
    //si la consulta exist trae algun email, quiere decir que ya hay un email registrado
    if (exist) return res.status(409).json({ message: 'El email ya está registrado' });

    //asigna un hash para el password, es decir, le da seguridad al password
    const hash = await bcrypt.hash(String(password), 10);
    //le pasamos el rol a la funcion roleToNivel y devuelve el nivel (numero), lo guardamos en nivel
    const nivel = roleToNivel(role);

    //run es un wrapper (envia directamente a la DB) y es una funcion exportada desde db.js
    //hace un insert y ademas como es una promesa (ver en db.js) devuelve this.lastID y this.changes
    const r = await run(
      `INSERT INTO Usuarios (Email, Password, Nombre, Apellido, Telefono, Direccion, Nivel)
      VALUES (?,?,?,?,?,?,?)`,
      [email, hash, name, '', '', '', nivel]
    );
    //guardamos ese lastID en userId
    const userId = r.lastID;
    //en payload guardamos todo lo relacionado al usuario
    const payload = { id: userId, email, role: nivelToRole(nivel), name };

    //le asignamos un token al usuario
    const token = signToken(payload);

    //devolvemos un json a la ruta que llamaron a este POST, en este caso a /register en AuthContext.jsx
    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});






//funcion CHECKEADA

router.post('/login', async (req, res) => {
  try {
    //guardamos el body de la request, si no alguno de los dos no tiene nada entra el if
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email y password son obligatorios' });

    //si tiene contenido mail y password guardamos en row la consulta de los datos de ese usuario
    const row = await get(
      //el where filtra con el '?', que es el parametro [email]
      `SELECT Id, Email, Password, Nivel, Nombre
        FROM Usuarios
        WHERE Email = ?`,
      [email] // ---> parametro del where
    );
    //si row no tiene nada hay error en las credenciales
    if (!row) return res.status(401).json({ message: 'Credenciales inválidas' });

    //guardamos en constante ok un booleano de la comparacion entre la password ingresada por el usuario con la guardada en al DB
    const ok = await bcrypt.compare(String(password), row.Password);
    //si ok es false devuelve mensaje credenciales invalidas
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    //si ok es true guardamos en role el nivel del usuario
    const role = nivelToRole(row.Nivel);
    //payload guardamos un objeto con campos de row
    const payload = { id: row.Id, email: row.Email, role, name: row.Nombre };
    //signToken le genera un token a ese usuario
    const token = signToken(payload);
    
    //retornamos el json con token y contenido de usuario
    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});






//funcion CHECKEADA

router.get('/whoami', authRequired, async (req, res) => {
  // esta API llama al usuario que esta solicitando
  //authrequired valida si el token es valido y no expiró
  const row = await get(`SELECT Id, Email, Nivel, Nombre FROM Usuarios WHERE Id=?`, [req.user.id]);
  //si no guarda nada en row no encontró al usuario
  if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
  //guardamos en role lo que devuelve la funcion nivelToRole
  const role = nivelToRole(row.Nivel);
  //guardamos en name el nombre y mail del usuario encontrado
  const name = row.Nombre || row.Email?.split('@')[0];
  res.json({ id: row.Id, email: row.Email, role, name });
});

export default router;