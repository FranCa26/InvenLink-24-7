const Venta = require("../models/ventasModels");
const Producto = require("../models/productosModels");

// Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.getAll();
    return res.status(200).json(ventas);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener las ventas",
      error: err.message,
    });
  }
};

// Obtener venta por ID
exports.getVentaById = async (req, res) => {
  const { Id_Venta } = req.params;
  try {
    const venta = await Venta.getById(Id_Venta);

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.status(200).json(venta);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener la venta",
      error: err.message,
    });
  }
};

// Crear una nueva venta
exports.createVenta = async (req, res) => {
  const { venta, detalles } = req.body;

  // Validar que se proporcionen los detalles
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      message: "Debe proporcionar al menos un producto en la venta",
    });
  }

  try {
    // Verificar stock disponible para cada producto
    for (const detalle of detalles) {
      const producto = await Producto.getByCod(detalle.Cod_Producto);

      if (!producto) {
        return res.status(404).json({
          message: `Producto con código ${detalle.Cod_Producto} no encontrado`,
        });
      }

      if (producto.Stock_Actual < detalle.Cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto ${producto.Nombre} (${detalle.Cod_Producto}). Disponible: ${producto.Stock_Actual}`,
        });
      }
    }

    // Calcular el total si no se proporciona
    if (!venta.Total) {
      venta.Total = detalles.reduce(
        (total, detalle) => total + detalle.Cantidad * detalle.Precio_Unitario,
        0
      );
    }

    // Si viene Cliente en lugar de Nombre_Cliente, hacer la conversión
    if (venta.Cliente && !venta.Nombre_Cliente) {
      venta.Nombre_Cliente = venta.Cliente;
    }

    const Id_Venta = await Venta.create(venta, detalles);

    return res.status(201).json({
      message: "Venta creada exitosamente",
      Id_Venta,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error al crear la venta",
      error: err.message,
    });
  }
};

// Obtener ventas por código de producto
exports.getVentasByProductCode = async (req, res) => {
  const { Cod_Producto } = req.params;
  try {
    // Verificar que el producto existe
    const producto = await Producto.getByCod(Cod_Producto);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const ventas = await Venta.getByProductCode(Cod_Producto);

    return res.status(200).json(ventas);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener las ventas",
      error: err.message,
    });
  }
};

// Obtener resumen de ventas para el dashboard
exports.getResumenVentas = async (req, res) => {
  try {
    const resumen = await Venta.getResumen();
    return res.status(200).json(resumen);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener el resumen de ventas",
      error: err.message,
    });
  }
};
