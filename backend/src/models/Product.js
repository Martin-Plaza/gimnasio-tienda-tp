import { all, get, run } from '../config/db.js';







/*-----------MODULO CHECKEADO-------------*/








//OBJETO PRODUCTS CHECKEADO
export const Products = {

  //Products.all trae a todos los productos
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


  //products.byid trae una consulta filtrado por id de producto
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




  //CREATE CHECKEADO
  create: async ({ name, price, stock, image_url = '', description = '' }) => {
    //le pasamos los parametros a create
    //en r guardamos la consulta con todos los parametros
    //retornamos el ultimo id creado
    const r = await run(
      `INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, ImageUrl)
       VALUES (?,?,?,?,?)`,
      [name, description, Number(price), Number(stock), image_url]
    );
    return Products.byId(r.lastID);
  },






  //UPDATE CHECKEADO
  update: async (id, p) => {
    const cur = await Products.byId(id);
    //guardamos en cur la consulta byId
    if (!cur) return null;

    const name        = p.name;
    const description = p.description ?? '';
    const price       = p.price;
    const stock       = p.stock;
    const image_url   = p.image_url ?? '';

    //guardamos constantes con los campos a actualizar
    //hacemos run de update y le pasamos los parametros que capturamos del parametro p
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
    //retornamos el id que le pasamos
    return Products.byId(id);
  },





//REMOVE CHECKEADO
remove: async (id) => {
  //pasamos de parametro el id que viene del products.routes, pero que viene del front
  //hacemos un delete filtrando por el id
  //retornamos si las filas cambiadas son mayor a 0 (changes > 0)
  const r = await run(`DELETE FROM Productos WHERE ProdId = ?`, [id]);
  return r.changes > 0;
}
};