const Producto = require("../models/productosModels");

// Obtener todos los productos
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    return res.status(200).json(productos || []);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener los productos",
      error: err.message,
    });
  }
};

// Obtener producto por Cod_Producto
exports.getProductoByCod = async (req, res) => {
  const { Cod_Producto } = req.params;
  try {
    const producto = await Producto.getByCod(Cod_Producto);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    return res.status(200).json(producto);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener el producto",
      error: err.message,
    });
  }
};

// Filtrar productos por nombre o categoría
exports.filterByCategoryOrName = async (req, res) => {
  const { filter } = req.query;

  if (!filter) {
    return res
      .status(400)
      .json({ message: "El parámetro 'filter' es obligatorio" });
  }

  try {
    const productos = await Producto.filter(filter);
    return res.status(200).json(productos || []);
  } catch (err) {
    return res.status(500).json({
      message: "Error al filtrar los productos",
      error: err.message,
    });
  }
};

// Actualizar stock de un producto
exports.updateStock = async (req, res) => {
  const { Cod_Producto } = req.params;
  const { cantidad } = req.body;

  if (isNaN(cantidad) || cantidad <= 0) {
    return res
      .status(400)
      .json({ message: "La cantidad debe ser un número mayor que 0." });
  }

  try {
    const producto = await Producto.getByCod(Cod_Producto);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const nuevoStock = producto.Stock_Actual + parseInt(cantidad);
    await Producto.updateStock(Cod_Producto, nuevoStock);

    return res.status(200).json({
      message: "Stock actualizado correctamente",
      nuevoStock,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error al actualizar el stock",
      error: err.message,
    });
  }
};

exports.addProducto = async (req, res) => {
  const {
    Cod_Producto,
    Nombre,
    Marca,
    Talle,
    Categoria,
    Stock_Inicial,
    Stock_Actual,
    Prec_Costo,
    Prec_Venta,
  } = req.body;

  if (
    !Cod_Producto ||
    !Nombre ||
    !Marca ||
    Talle === undefined ||
    !Categoria ||
    Stock_Inicial === undefined ||
    Stock_Actual === undefined ||
    Prec_Costo === undefined ||
    Prec_Venta === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const productoExistente = await Producto.getByCod(Cod_Producto);

    if (productoExistente) {
      return res
        .status(400)
        .json({ message: "El código de producto ya existe." });
    }

    await Producto.create({
      Cod_Producto,
      Nombre,
      Marca,
      Talle,
      Categoria,
      Stock_Inicial,
      Stock_Actual,
      Prec_Costo,
      Prec_Venta,
    });

    return res
      .status(201)
      .json({ message: "Producto agregado correctamente." });
  } catch (err) {
    return res.status(500).json({
      message: "Error al agregar el producto",
      error: err.message,
    });
  }
};

// Corregir la validación en el método updateProducto
exports.updateProducto = async (req, res) => {
  const { Cod_Producto } = req.params;
  const {
    Nombre,
    Marca,
    Talle,
    Categoria,
    Stock_Inicial,
    Stock_Actual,
    Prec_Costo,
    Prec_Venta,
    Estado,
  } = req.body;

  if (
    !Cod_Producto ||
    !Nombre ||
    !Marca ||
    !Talle ||
    !Categoria ||
    Stock_Inicial === undefined ||
    Stock_Actual === undefined ||
    isNaN(Prec_Costo) ||
    isNaN(Prec_Venta) ||
    Estado === undefined
  ) {
    return res.status(400).json({
      message:
        "Todos los campos son obligatorios y los precios deben ser números válidos.",
    });
  }

  try {
    const producto = await Producto.getByCod(Cod_Producto);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    await Producto.update(Cod_Producto, {
      Nombre,
      Marca,
      Talle,
      Categoria,
      Stock_Inicial,
      Stock_Actual,
      Prec_Costo,
      Prec_Venta,
      Estado,
    });

    return res
      .status(200)
      .json({ message: "Producto actualizado correctamente." });
  } catch (err) {
    return res.status(500).json({
      message: "Error al actualizar el producto",
      error: err.message,
    });
  }
};
