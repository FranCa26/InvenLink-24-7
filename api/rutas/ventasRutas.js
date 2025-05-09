///ventasRutas.js
const express = require("express");
const router = express.Router();
const ventasController = require("../controls/ventasController");

// Obtener todas las ventas
router.get("/", ventasController.getVentas);

// Obtener resumen de ventas para el dashboard
router.get("/resumen", ventasController.getResumenVentas);

// Obtener ventas por código de producto
router.get("/producto/:Cod_Producto", ventasController.getVentasByProductCode);

// Obtener venta por ID
router.get("/:Id_Venta", ventasController.getVentaById);

// Crear una nueva venta
router.post("/", ventasController.createVenta);

module.exports = router;
