import { all, get, run } from '../config/db.js';

export const Products = {
  all: async () => {
    return all(`
      SELECT
        ProdId       AS id,
        Nombre       AS name,
        Descripcion  AS description,
        Precio       AS price,
        Stock        AS stock,
        ImageUrl     AS image_url
      FROM Productos
      ORDER BY ProdId DESC
    `);
  },

  byId: async (id) => {
    return get(`
      SELECT
        ProdId       AS id,
        Nombre       AS name,
        Descripcion  AS description,
        Precio       AS price,
        Stock        AS stock,
        ImageUrl     AS image_url
      FROM Productos
      WHERE ProdId = ?
    `, [id]);
  },

  create: async ({ name, price, stock, image_url = '', description = '' }) => {
    const r = await run(
      `INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, ImageUrl)
       VALUES (?,?,?,?,?)`,
      [name, description, Number(price), Number(stock), image_url]
    );
    return Products.byId(r.lastID);
  },

  update: async (id, p) => {
    const cur = await Products.byId(id);
    if (!cur) return null;

    const name        = p.name        ?? cur.name;
    const description = p.description ?? cur.description ?? '';
    const price       = p.price       ?? cur.price;
    const stock       = p.stock       ?? cur.stock;
    const image_url   = p.image_url   ?? cur.image_url ?? '';

    await run(
      `UPDATE Productos
         SET Nombre = ?,
             Descripcion = ?,
             Precio = ?,
             Stock = ?,
             ImageUrl = ?
       WHERE ProdId = ?`,
      [name, description, Number(price), Number(stock), image_url, id]
    );

    return Products.byId(id);
  },

remove: async (id) => {
  const r = await run(`DELETE FROM Productos WHERE ProdId = ?`, [id]);
  return r.changes > 0;
}
};