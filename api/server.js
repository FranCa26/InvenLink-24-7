// En api/server.js
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productosRoutes = require("./rutas/productosRutas");
const ventasRoutes = require("./rutas/ventasRutas");
const entradas = require("./rutas/entradasRutas");
const authRoutes = require("./rutas/authRutas");
const morgan = require("morgan");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

// *IMPORTANTE*: Sirve los archivos estáticos de la carpeta 'dist' del frontend
const frontendBuildPath = path.join(__dirname, "../cliente/dist");
app.use(express.static(frontendBuildPath));

// Rutas de la API (van DESPUÉS de servir los archivos estáticos)
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/entradas", entradas);
app.use("/api/auth", authRoutes);

// *IMPORTANTE*: El manejador de rutas no encontradas (para las rutas de la API) debe ir DESPUÉS de servir los archivos estáticos
app.use("/api/*", (req, res) => {
  // Especifica el prefijo /api/ para no interferir con las rutas del frontend
  console.log(`Ruta de API no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Ruta de API no encontrada" });
});

// *IMPORTANTE*: Este manejador de rutas no encontradas es para cualquier otra petición que no coincida con los archivos estáticos o las rutas de la API. Esto es crucial para que el enrutamiento del frontend (si lo tiene) funcione.
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(`Error en la solicitud ${req.method} ${req.url}:`, err);
  res
    .status(500)
    .json({ message: "Error interno del servidor", error: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
