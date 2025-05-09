
const express = require("express");
const router = express.Router();
const productosController = require("../controls/productosControler");
const authMiddleware = require("../middleware/authMiddleware");

// Ruta de prueba para verificar que las rutas de productos funcionan
router.get("/test", (req, res) => {
  res.json({ message: "Las rutas de productos están funcionando" });
});

// Rutas públicas (accesibles sin autenticación)
// Obtener todos los productos
router.get("/", productosController.getProductos);

// Filtrar productos por nombre o categoría
router.get("/filter/name-category", productosController.filterByCategoryOrName);

// Obtener producto por Cod_Producto
router.get("/:Cod_Producto", productosController.getProductoByCod);

// Actualizar stock de un producto (pública)
router.put("/:Cod_Producto/stock", productosController.updateStock);

// 🔹 Agregar un nuevo producto (pública)
router.post("/", productosController.addProducto);

// 🔹 Actualizar un producto (cualquier campo) - PROTEGIDA
router.put(
  "/:Cod_Producto",
  authMiddleware.verificarToken,
  productosController.updateProducto
);

module.exports = router;

