

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
  const fechaUTC = new Date();
  const offsetArgentina = 3 * 60 * 60 * 1000;
  const timestampArgentina = fechaUTC.getTime() - offsetArgentina;
  const fechaArgentina = new Date(timestampArgentina);

  const año = fechaArgentina.getUTCFullYear();
  const mes = String(fechaArgentina.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fechaArgentina.getUTCDate()).padStart(2, "0");
  const hora = String(fechaArgentina.getUTCHours()).padStart(2, "0");
  const minutos = String(fechaArgentina.getUTCMinutes()).padStart(2, "0");
  const segundos = String(fechaArgentina.getUTCSeconds()).padStart(2, "0");

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
}

// Función para formatear fechas MySQL a un formato estándar
function formatearFechaParaCliente(fechaMySQL) {
  if (!fechaMySQL) return null;

  if (typeof fechaMySQL === "string") {
    return fechaMySQL;
  }

  try {
    const fecha = new Date(fechaMySQL);

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

class Venta {
  // Obtener todas las ventas
  static async getAll() {
    let conn;
    try {
      conn = await pool.getConnection();

      const query = `
        SELECT v.*, 
               GROUP_CONCAT(CONCAT(dv.Cod_Producto, ':', dv.Cantidad, ':', dv.Precio_Unitario) SEPARATOR '|') as Detalles
        FROM ventas v
        LEFT JOIN detalles_venta dv ON v.Id_Venta = dv.Id_Venta
        GROUP BY v.Id_Venta
        ORDER BY v.Fecha DESC
      `;

      const rows = await conn.query(query);

      const ventas = rows.map((venta) => {
        const detallesProcesados = [];

        if (venta.Detalles) {
          const detallesArray = venta.Detalles.split("|");
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

        const fechaFormateada = formatearFechaParaCliente(venta.Fecha);

        const ventaConDetalles = {
          ...venta,
          Fecha: fechaFormateada,
          Detalles: detallesProcesados,
        };

        return convertBigIntToString(ventaConDetalles);
      });

      return ventas;
    } catch (err) {
      return [];
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Obtener venta por ID
  static async getById(Id_Venta) {
    let conn;
    try {
      conn = await pool.getConnection();

      const ventaQuery = "SELECT * FROM ventas WHERE Id_Venta = ?";
      const ventaRows = await conn.query(ventaQuery, [Id_Venta]);

      if (!ventaRows || ventaRows.length === 0) {
        return null;
      }

      const venta = ventaRows[0];

      venta.Fecha = formatearFechaParaCliente(venta.Fecha);

      const detallesQuery = `
        SELECT dv.*, p.Nombre as Nombre_Producto, p.Marca
        FROM detalles_venta dv
        LEFT JOIN productos p ON dv.Cod_Producto = p.Cod_Producto
        WHERE dv.Id_Venta = ?
      `;

      const detallesRows = await conn.query(detallesQuery, [Id_Venta]);
      venta.Detalles = detallesRows || [];

      return convertBigIntToString(venta);
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Crear una nueva venta
  static async create(venta, detalles) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const fecha = obtenerFechaArgentina();

      const ventaQuery = `
        INSERT INTO ventas (Fecha, Nombre_Cliente, Total, Metodo_Pago, Observaciones)
        VALUES (?, ?, ?, ?, ?)
      `;

      const ventaResult = await conn.query(ventaQuery, [
        fecha,
        venta.Cliente || "Cliente General",
        venta.Total,
        venta.Metodo_Pago || "Efectivo",
        venta.Observaciones || "",
      ]);

      const Id_Venta = ventaResult.insertId;

      for (const detalle of detalles) {
        const detalleQuery = `
          INSERT INTO detalles_venta (Id_Venta, Cod_Producto, Cantidad, Precio_Unitario)
          VALUES (?, ?, ?, ?)
        `;

        await conn.query(detalleQuery, [
          Id_Venta,
          detalle.Cod_Producto,
          detalle.Cantidad,
          detalle.Precio_Unitario,
        ]);

        const updateStockQuery = `
          UPDATE productos 
          SET Stock_Actual = Stock_Actual - ? 
          WHERE Cod_Producto = ?
        `;

        await conn.query(updateStockQuery, [
          detalle.Cantidad,
          detalle.Cod_Producto,
        ]);
      }

      await conn.commit();

      return Id_Venta.toString();
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

  // Obtener ventas por código de producto
  static async getByProductCode(Cod_Producto) {
    let conn;
    try {
      conn = await pool.getConnection();

      const query = `
        SELECT v.*, dv.Cantidad, dv.Precio_Unitario
        FROM ventas v
        JOIN detalles_venta dv ON v.Id_Venta = dv.Id_Venta
        WHERE dv.Cod_Producto = ?
        ORDER BY v.Fecha DESC
      `;

      const rows = await conn.query(query, [Cod_Producto]);

      const ventasFormateadas = rows.map((venta) => ({
        ...venta,
        Fecha: formatearFechaParaCliente(venta.Fecha),
      }));

      return convertBigIntToString(ventasFormateadas);
    } catch (err) {
      return [];
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Obtener resumen de ventas (para dashboard)
  static async getResumen() {
    let conn;
    try {
      conn = await pool.getConnection();

      const fechaActual = new Date();
      const hoy = fechaActual.toISOString().split("T")[0];

      const ventasHoyQuery = `
        SELECT SUM(Total) as Total
        FROM ventas
        WHERE DATE(Fecha) = ?
      `;
      const ventasHoyResult = await conn.query(ventasHoyQuery, [hoy]);
      const ventasHoy = ventasHoyResult[0].Total || 0;

      const inicioSemana = new Date(fechaActual);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const inicioSemanaFormatted = inicioSemana
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const ventasSemanaQuery = `
        SELECT SUM(Total) as Total
        FROM ventas
        WHERE Fecha >= ?
      `;
      const ventasSemanaResult = await conn.query(ventasSemanaQuery, [
        inicioSemanaFormatted,
      ]);
      const ventasSemana = ventasSemanaResult[0].Total || 0;

      const inicioMes = new Date(fechaActual);
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const inicioMesFormatted = inicioMes
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const ventasMesQuery = `
        SELECT SUM(Total) as Total
        FROM ventas
        WHERE Fecha >= ?
      `;
      const ventasMesResult = await conn.query(ventasMesQuery, [
        inicioMesFormatted,
      ]);
      const ventasMes = ventasMesResult[0].Total || 0;

      return {
        ventasHoy: ventasHoy.toFixed(2),
        ventasSemana: ventasSemana.toFixed(2),
        ventasMes: ventasMes.toFixed(2),
      };
    } catch (err) {
      return { ventasHoy: 0, ventasSemana: 0, ventasMes: 0 };
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = Venta;
