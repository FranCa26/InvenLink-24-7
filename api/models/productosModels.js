const pool = require("../config/db.js");

class Producto {
  // Obtener todos los productos
  static async getAll() {
    let conn;
    try {
      conn = await pool.getConnection();

      const rows = await conn.query("SELECT * FROM productos");

      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error("Error al obtener los productos:", err);
      return [];
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Obtener producto por Cod_Producto
  static async getByCod(Cod_Producto) {
    let conn;
    try {
      conn = await pool.getConnection();

      const rows = await conn.query(
        "SELECT * FROM productos WHERE Cod_Producto = ?",
        [Cod_Producto]
      );

      if (!rows || rows.length === 0) {
        return null;
      } else {
        return rows[0]; // Retorna el primer producto que coincida con el código
      }
    } catch (err) {
      console.error(
        `Error al obtener el producto con Cod_Producto ${Cod_Producto}:`,
        err
      );
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Filtrar productos por nombre o categoría
  static async filter(filter) {
    let conn;
    try {
      conn = await pool.getConnection();

      // Realiza la consulta con LIKE para buscar coincidencias en nombre o categoría
      const rows = await conn.query(
        "SELECT * FROM productos WHERE Nombre LIKE ? OR Categoria LIKE ?",
        [`%${filter}%`, `%${filter}%`]
      );

      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error("Error al filtrar los productos:", err);
      return [];
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Actualizar stock de producto
  static async updateStock(Cod_Producto, cantidad) {
    let conn;
    try {
      conn = await pool.getConnection();

      await conn.query(
        "UPDATE productos SET Stock_Actual = ? WHERE Cod_Producto = ?",
        [cantidad, Cod_Producto]
      );
    } catch (err) {
      console.error(
        `Error al actualizar el stock del producto con Cod_Producto ${Cod_Producto}:`,
        err
      );
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Insertar un nuevo producto
  static async create(producto) {
    let conn;
    try {
      conn = await pool.getConnection();

      // No incluir la columna Estado en la inserción, ya que es generada automáticamente
      const query = `
        INSERT INTO productos 
        (Cod_Producto, Nombre, Marca, Talle, Categoria, Stock_Inicial, Stock_Actual, Prec_Costo, Prec_Venta) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        producto.Cod_Producto,
        producto.Nombre,
        producto.Marca,
        producto.Talle,
        producto.Categoria,
        producto.Stock_Inicial,
        producto.Stock_Actual,
        producto.Prec_Costo,
        producto.Prec_Venta,
      ];

      await conn.query(query, values);
    } catch (err) {
      console.error("Error al crear el producto:", err);
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Actualizar un producto
  static async update(Cod_Producto, datos) {
    let conn;
    try {
      conn = await pool.getConnection();

      // Filtrar campos undefined y eliminar Estado si está presente
      const fields = Object.keys(datos).filter(
        (key) => datos[key] !== undefined && key !== "Estado"
      );

      if (fields.length === 0) {
        return;
      }

      const values = fields.map((field) => datos[field]);

      const query = `
        UPDATE productos 
        SET ${fields.map((field) => `${field} = ?`).join(", ")}
        WHERE Cod_Producto = ?`;

      await conn.query(query, [...values, Cod_Producto]);
    } catch (err) {
      console.error("Error al actualizar el producto:", err);
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = Producto;
