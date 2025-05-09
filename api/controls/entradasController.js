const Entrada = require("../models/entradasModels");
const Producto = require("../models/productosModels");

// Obtener todas las entradas
exports.getEntradas = async (req, res) => {
  try {
    const entradas = await Entrada.getAll();
    return res.status(200).json(entradas);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener las entradas",
      error: err.message,
    });
  }
};

// Obtener entrada por ID
exports.getEntradaById = async (req, res) => {
  const { Id_Entrada } = req.params;
  try {
    const entrada = await Entrada.getById(Id_Entrada);

    if (!entrada) {
      return res.status(404).json({ message: "Entrada no encontrada" });
    }

    return res.status(200).json(entrada);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener la entrada",
      error: err.message,
    });
  }
};

// Crear una nueva entrada
exports.createEntrada = async (req, res) => {
  const { entrada, detalles } = req.body;

  // Validar que se proporcionen los detalles
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      message: "Debe proporcionar al menos un producto en la entrada",
    });
  }

  try {
    // Verificar que los productos existan
    for (const detalle of detalles) {
      const producto = await Producto.getByCod(detalle.Cod_Producto);

      if (!producto) {
        return res.status(404).json({
          message: `Producto con código ${detalle.Cod_Producto} no encontrado`,
        });
      }
    }

    // Calcular el total si no se proporciona
    if (!entrada.Total) {
      entrada.Total = detalles.reduce(
        (total, detalle) => total + detalle.Cantidad * detalle.Precio_Unitario,
        0
      );
    }

    const Id_Entrada = await Entrada.create(entrada, detalles);

    return res.status(201).json({
      message: "Entrada creada exitosamente",
      Id_Entrada,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error al crear la entrada",
      error: err.message,
    });
  }
};

// Obtener resumen de entradas para el dashboard
exports.getResumenEntradas = async (req, res) => {
  try {
    const resumen = await Entrada.getResumen();
    return res.status(200).json(resumen);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener el resumen de entradas",
      error: err.message,
    });
  }
};
