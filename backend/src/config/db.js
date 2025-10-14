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
export const run = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
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