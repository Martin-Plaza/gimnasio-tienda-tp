import bcrypt from 'bcrypt';
import { all, run } from '../config/db.js';

async function migratePasswords() {
  const users = await all(`SELECT Id, Password FROM Usuarios`);

  for (const u of users) {
    // Si ya es un hash (comienza con $2b$), lo saltamos
    if (u.Password && u.Password.startsWith('$2b$')) continue;

    // Convertir password plano → hash
    const newHash = await bcrypt.hash(String(u.Password), 10);

    console.log(`🔐 Actualizando usuario ${u.Id} con password hash`);
    await run(`UPDATE Usuarios SET Password = ? WHERE Id = ?`, [newHash, u.Id]);
  }

  console.log("✅ Migración completada. Todas las passwords están en formato seguro.");
  process.exit(0);
}

migratePasswords();