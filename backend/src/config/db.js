import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ⚠️ Ruta fija y estable: backend/src/data/gym.db
const DB_DIR  = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'gym.db');

// Crear carpeta si falta (evita SQLITE_CANTOPEN)
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Abrir DB con CREATE por si no existe el archivo
export const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
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




export const get = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

export const all = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export default db;