
const mariadb = require("mariadb");
const dotenv = require("dotenv");

dotenv.config();

// Configuración del pool de conexiones
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "HolaMundo123",
  database: process.env.DB_NAME || "inventario",
  connectionLimit: 5,
  // Añadir opciones para mejorar la estabilidad de la conexión
  connectTimeout: 10000, // 10 segundos
  acquireTimeout: 10000, // 10 segundos
  waitForConnections: true,
  queueLimit: 0,
});

// Verificar la conexión
pool
  .getConnection()
  .then((conn) => {
    console.log("Conexión exitosa a la base de datos");
    // Verificar que la tabla productos existe
    return conn.query("SHOW TABLES LIKE 'productos'").then((tables) => {
      if (tables.length === 0) {
        console.warn(
          '¡ADVERTENCIA! La tabla "productos" no existe en la base de datos.'
        );
      } else {
       ///  console.log('Tabla "productos" encontrada en la base de datos.');
      }
      conn.release();
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

module.exports = pool;