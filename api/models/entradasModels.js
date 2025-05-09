const pool = require("../config/db.js");

// Función auxiliar para convertir BigInt a String en objetos
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntToString(item));
  }

  if (typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      result[key] = convertBigIntToString(obj[key]);
    }
    return result;
  }

  return obj;
}

// Función para obtener la fecha actual en formato Argentina (GMT-3)
function obtenerFechaArgentina() {
  // Crear fecha actual en UTC
  const fechaUTC = new Date();

  // Ajustamos 3 horas hacia atrás (Argentina es GMT-3)
  const offsetArgentina = 3 * 60 * 60 * 1000;
  const timestampArgentina = fechaUTC.getTime() - offsetArgentina;

  // Creamos una nueva fecha con el timestamp ajustado
  const fechaArgentina = new Date(timestampArgentina);

  // Formatear para MySQL (YYYY-MM-DD HH:MM:SS)
  const año = fechaArgentina.getUTCFullYear();
  const mes = String(fechaArgentina.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fechaArgentina.getUTCDate()).padStart(2, "0");
  const hora = String(fechaArgentina.getUTCHours()).padStart(2, "0");
  const minutos = String(fechaArgentina.getUTCMinutes()).padStart(2, "0");
  const segundos = String(fechaArgentina.getUTCSeconds()).padStart(2, "0");

  const fechaFormateada = `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

  return fechaFormateada;
}

// Función para formatear fechas MySQL a un formato estándar
function formatearFechaParaCliente(fechaMySQL) {
  if (!fechaMySQL) return null;

  // Si ya es un string, devolverlo tal cual
  if (typeof fechaMySQL === "string") {
    return fechaMySQL;
  }

  // Si es un objeto Date de MySQL, convertirlo a string en formato YYYY-MM-DD HH:MM:SS
  try {
    const fecha = new Date(fechaMySQL);

    // Verificar si es una fecha válida
    if (isNaN(fecha.getTime())) {
      return String(fechaMySQL);
    }

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const segundos = String(fecha.getSeconds()).padStart(2, "0");

    return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
  } catch (error) {
    return String(fechaMySQL);
  }
}

class Entrada {
  // Obtener todas las entradas
  static async getAll() {
    let conn;
    try {
      conn = await pool.getConnection();

      const query = `
        SELECT e.*, 
               GROUP_CONCAT(CONCAT(de.Cod_Producto, ':', de.Cantidad, ':', de.Precio_Unitario) SEPARATOR '|') as Detalles
        FROM entradas e
        LEFT JOIN detalles_entrada de ON e.Id_Entrada = de.Id_Entrada
        GROUP BY e.Id_Entrada
        ORDER BY e.Fecha DESC
      `;

      const rows = await conn.query(query);

      // Procesar los detalles de cada entrada
      const entradas = rows.map((entrada) => {
        const detallesProcesados = [];

        if (entrada.Detalles) {
          const detallesArray = entrada.Detalles.split("|");
          detallesArray.forEach((detalle) => {
            const [Cod_Producto, Cantidad, Precio_Unitario] =
              detalle.split(":");
            detallesProcesados.push({
              Cod_Producto,
              Cantidad: Number.parseInt(Cantidad),
              Precio_Unitario: Number.parseFloat(Precio_Unitario),
            });
          });
        }

        // Formatear la fecha para el cliente
        const fechaFormateada = formatearFechaParaCliente(entrada.Fecha);

        const entradaConDetalles = {
          ...entrada,
          Fecha: fechaFormateada,
          Detalles: detallesProcesados,
        };

        return convertBigIntToString(entradaConDetalles);
      });

      return entradas;
    } catch (err) {
      return [];
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Obtener entrada por ID
  static async getById(Id_Entrada) {
    let conn;
    try {
      conn = await pool.getConnection();

      // Obtener la entrada
      const entradaQuery = "SELECT * FROM entradas WHERE Id_Entrada = ?";
      const entradaRows = await conn.query(entradaQuery, [Id_Entrada]);

      if (!entradaRows || entradaRows.length === 0) {
        return null;
      }

      const entrada = entradaRows[0];

      // Formatear la fecha para el cliente
      entrada.Fecha = formatearFechaParaCliente(entrada.Fecha);

      // Obtener los detalles de la entrada
      const detallesQuery = `
        SELECT de.*, p.Nombre as Nombre_Producto, p.Marca
        FROM detalles_entrada de
        LEFT JOIN productos p ON de.Cod_Producto = p.Cod_Producto
        WHERE de.Id_Entrada = ?
      `;

      const detallesRows = await conn.query(detallesQuery, [Id_Entrada]);
      entrada.Detalles = detallesRows || [];

      return convertBigIntToString(entrada);
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Crear una nueva entrada
  static async create(entrada, detalles) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Obtener la fecha actual en formato Argentina
      const fecha = obtenerFechaArgentina();

      // Insertar la entrada
      const entradaQuery = `
        INSERT INTO entradas (Fecha, Proveedor, Total, Numero_Factura, Observaciones)
        VALUES (?, ?, ?, ?, ?)
      `;

      const entradaResult = await conn.query(entradaQuery, [
        fecha,
        entrada.Proveedor || "Proveedor General",
        entrada.Total,
        entrada.Numero_Factura || "",
        entrada.Observaciones || "",
      ]);

      const Id_Entrada = entradaResult.insertId;

      // Insertar los detalles de la entrada y actualizar el stock
      for (const detalle of detalles) {
        // Insertar detalle
        const detalleQuery = `
          INSERT INTO detalles_entrada (Id_Entrada, Cod_Producto, Cantidad, Precio_Unitario)
          VALUES (?, ?, ?, ?)
        `;

        await conn.query(detalleQuery, [
          Id_Entrada,
          detalle.Cod_Producto,
          detalle.Cantidad,
          detalle.Precio_Unitario,
        ]);

        // Actualizar stock del producto
        const updateStockQuery = `
          UPDATE productos 
          SET Stock_Actual = Stock_Actual + ?, 
              Prec_Costo = ?,
              Prec_Venta = CASE 
                WHEN Prec_Venta = 0 THEN ? * 1.3
                ELSE Prec_Venta
              END
          WHERE Cod_Producto = ?
        `;

        await conn.query(updateStockQuery, [
          detalle.Cantidad,
          detalle.Precio_Unitario,
          detalle.Precio_Unitario,
          detalle.Cod_Producto,
        ]);
      }

      await conn.commit();

      // Convertir el ID a string para evitar problemas con BigInt
      return Id_Entrada.toString();
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Obtener resumen de entradas (para dashboard)
  static async getResumen() {
    let conn;
    try {
      conn = await pool.getConnection();

      // Fecha actual en Argentina
      const fechaActual = new Date();
      const hoy = fechaActual.toISOString().split("T")[0];

      // Entradas de hoy
      const entradasHoyQuery = `
        SELECT SUM(Total) as Total
        FROM entradas
        WHERE DATE(Fecha) = ?
      `;
      const entradasHoyResult = await conn.query(entradasHoyQuery, [hoy]);
      const entradasHoy = entradasHoyResult[0].Total || 0;

      // Entradas del mes
      const inicioMes = new Date(fechaActual);
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const inicioMesFormatted = inicioMes
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const entradasMesQuery = `
        SELECT SUM(Total) as Total
        FROM entradas
        WHERE Fecha >= ?
      `;
      const entradasMesResult = await conn.query(entradasMesQuery, [
        inicioMesFormatted,
      ]);
      const entradasMes = entradasMesResult[0].Total || 0;

      // Productos más comprados
      const productosMasCompradosQuery = `
        SELECT de.Cod_Producto, p.Nombre, SUM(de.Cantidad) as Cantidad
        FROM detalles_entrada de
        JOIN productos p ON de.Cod_Producto = p.Cod_Producto
        GROUP BY de.Cod_Producto
        ORDER BY Cantidad DESC
        LIMIT 5
      `;
      const productosMasCompradosResult = await conn.query(
        productosMasCompradosQuery
      );

      return {
        entradasHoy,
        entradasMes,
        productosMasComprados: productosMasCompradosResult,
      };
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = Entrada;
