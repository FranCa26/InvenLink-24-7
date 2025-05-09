// routes/entradas.js
const express = require("express");
const router = express.Router();
const entradasController = require("../controls/entradasController");
const authMiddleware = require("../middleware/authMiddleware");
// Rutas para entradas

router.get("/", authMiddleware.verificarToken, entradasController.getEntradas); // Ruta protegida
router.get("/:Id_Entrada", entradasController.getEntradaById);
router.post("/", entradasController.createEntrada);
router.get("/resumen/dashboard", entradasController.getResumenEntradas);

module.exports = router;
