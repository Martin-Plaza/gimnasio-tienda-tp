import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';


/*-------------MODULO CHECKEADO----------------*/





sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url); //ruta actual
const __dirname  = path.dirname(__filename); //ruta completa

// Ruta fija y estable: backend/src/data/gym.db
const DB_DIR  = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'gym.db');

// Abrir la DB
export const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(`[SQLite] No se pudo abrir: ${DB_PATH}\n`, err);
    } else {
      console.log(`[SQLite] OK -> ${DB_PATH}`);
    }
  }
);

// Helpers promisificados

//FUNCION CHECKEADA
//run espera los comandos de SQL y los parametros (en este caso es para POST de register)
export const run = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    //devuelve una promesa para poder poder usar Await
    //db.run ejecuta sentencias que no devuelven filas (es para INSERT, DELETE, UPDATE)
    //db.run ademas bindea parametros (por ejemplo: INSERT "nombre", "apellido", [nombre, apellido])
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      //ademas de ejecutar (INSERT,DELETE,UPDATE) tambien cuando resuelve la promesa devuelve lastID y changes
      //this hace referencia a la fila que se acaba de agregar
      //lastID es el id que se acaba de agregar y changes a la cantidad de filas afectadas
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });



//FUNCION CHECKEADA
export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    //db.get trae una sola fila (la primera)
    //err es el error, y si es exitosa la consulta resuelve en row, que es lo que va a traer desde la db
    db.get(sql,params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

//FUNCION CHECKEADA
export const all = (sql, params =[]) =>
  new Promise((resolve, reject) => {
    //db.all ejecuta un select
    //le pasamos desde orders.routes la consulta
    //err es el error, y si es exitosa la consulta resuelve en rows, que es lo que va a traer desde la db
    db.all(sql,params,(err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export default db;