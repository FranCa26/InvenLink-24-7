const express = require("express");
const router = express.Router();
const authController = require("../controls/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Ruta para login
router.post("/login", authController.login);

// Ruta para registro (protegida, solo administradores)
router.post(
  "/register",
  authMiddleware.verificarToken,
  authMiddleware.esAdmin,
  authController.register
);

// Ruta para verificar token
router.get(
  "/verificar",
  authMiddleware.verificarToken,
  authController.verificarToken
);

module.exports = router;
