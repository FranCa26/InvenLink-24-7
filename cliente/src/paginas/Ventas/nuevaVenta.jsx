"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  AlertTriangle,
  X,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

export const NuevaVenta = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cliente, setCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [observaciones, setObservaciones] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Referencia para el panel de resultados de búsqueda
  const searchResultsRef = useRef(null);

  // Load available products
  useEffect(() => {
    fetch("http://localhost:5000/api/productos")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Filter only products with available stock
        const productosDisponibles = data.filter((p) => p.Stock_Actual > 0);
        setProductos(productosDisponibles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Manejador para cerrar el panel de resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        !event.target.closest('input[data-search="true"]') &&
        !event.target.closest('button[data-search="true"]')
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchResultsRef]);

  // Calculate total sale
  const calcularTotal = () => {
    return productosSeleccionados.reduce(
      (total, item) => total + item.cantidad * item.precio,
      0
    );
  };

  // Function to ensure a value is numeric
  const asegurarNumero = (valor) => {
    // If it's a string, convert to number
    if (typeof valor === "string") {
      return Number.parseFloat(valor) || 0;
    }
    // If it's already a number, return it
    if (typeof valor === "number") {
      return valor;
    }
    // If it's undefined, null or any other type, return 0
    return 0;
  };

  // Add product to the sale
  const agregarProducto = (producto) => {
    // Check if the product is already in the list
    const existe = productosSeleccionados.find(
      (item) => item.Cod_Producto === producto.Cod_Producto
    );

    // Ensure the price is a number
    const precioNumerico = asegurarNumero(producto.Prec_Venta);

    if (existe) {
      // If it already exists, increment the quantity
      setProductosSeleccionados(
        productosSeleccionados.map((item) =>
          item.Cod_Producto === producto.Cod_Producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      // If it doesn't exist, add it to the list
      setProductosSeleccionados([
        ...productosSeleccionados,
        {
          Cod_Producto: producto.Cod_Producto,
          nombre: producto.Nombre,
          precio: precioNumerico,
          stockDisponible: producto.Stock_Actual,
          cantidad: 1,
        },
      ]);
    }

    // Ocultar resultados después de agregar
    setShowSearchResults(false);
  };

  // Remove product from the sale
  const eliminarProducto = (Cod_Producto) => {
    setProductosSeleccionados(
      productosSeleccionados.filter(
        (item) => item.Cod_Producto !== Cod_Producto
      )
    );
  };

  // Update product quantity
  const actualizarCantidad = (Cod_Producto, cantidad) => {
    const producto = productosSeleccionados.find(
      (item) => item.Cod_Producto === Cod_Producto
    );

    if (!producto) return;

    // Validate that the quantity is not greater than the available stock
    const nuevaCantidad = Math.min(
      Math.max(1, cantidad), // Minimum 1
      producto.stockDisponible // Maximum available stock
    );

    setProductosSeleccionados(
      productosSeleccionados.map((item) =>
        item.Cod_Producto === Cod_Producto
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  // Filter products by search term
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.Cod_Producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.Categoria &&
        producto.Categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Search product by exact code
  const buscarProductoPorCodigo = () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/productos/${searchTerm.trim()}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Producto no encontrado");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((producto) => {
        if (producto && producto.Cod_Producto) {
          // If the product is not in the product list, add it
          if (
            !productos.some((p) => p.Cod_Producto === producto.Cod_Producto)
          ) {
            setProductos((prevProductos) => [...prevProductos, producto]);
          }

          // Add the product to the sale
          if (producto.Stock_Actual > 0) {
            agregarProducto(producto);
            setSearchTerm("");
          } else {
            alert("El producto no tiene stock disponible");
          }
        } else {
          alert("Producto no encontrado");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al buscar el producto:", error);
        alert(error.message);
        setLoading(false);
      });
  };

  // Save the sale
  const guardarVenta = async () => {
    if (productosSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un producto");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const venta = {
        Fecha: new Date(),
        Cliente: cliente || "Cliente General",
        Total: calcularTotal(),
        Metodo_Pago: metodoPago,
        Observaciones: observaciones,
      };

      const detalles = productosSeleccionados.map((item) => ({
        Cod_Producto: item.Cod_Producto,
        Cantidad: item.cantidad,
        Precio_Unitario: item.precio,
      }));

      const response = await fetch("http://localhost:5000/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ venta, detalles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la venta");
      }

      alert("Venta registrada exitosamente");
      navigate("/ventas");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Nueva Venta
            </h1>
            <button
              onClick={() => navigate("/ventas")}
              className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span>Volver</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 text-red-700 dark:text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
              <p>Error: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: Sale data */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 transition-all">
                <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                  Datos de la Venta
                </h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Observaciones adicionales"
                    className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                    rows="3"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span className="text-slate-700 dark:text-slate-300">
                      Total:
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1 rounded-full">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={guardarVenta}
                  disabled={submitting || productosSeleccionados.length === 0}
                  className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      <span>Guardar Venta</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Center column: Selected products */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-all">
                <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                  Productos Seleccionados
                </h2>

                {productosSeleccionados.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <p>No hay productos seleccionados</p>
                  </div>
                ) : (
                  <div className="flex-grow overflow-y-auto">
                    <ul className="space-y-3">
                      {productosSeleccionados.map((item) => (
                        <li
                          key={item.Cod_Producto}
                          className="border border-slate-200 dark:border-gray-700 rounded-xl p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">
                                {item.nombre}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Código: {item.Cod_Producto}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                                ${item.precio.toFixed(2)} c/u
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                eliminarProducto(item.Cod_Producto)
                              }
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center">
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  item.Cod_Producto,
                                  item.cantidad - 1
                                )
                              }
                              className="px-2 py-1 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-l-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stockDisponible}
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(
                                  item.Cod_Producto,
                                  Number.parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 text-center border-t border-b border-slate-300 dark:border-gray-600 py-1 bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  item.Cod_Producto,
                                  item.cantidad + 1
                                )
                              }
                              className="px-2 py-1 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-r-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                              disabled={item.cantidad >= item.stockDisponible}
                            >
                              +
                            </button>
                            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                              (Stock: {item.stockDisponible})
                            </span>
                          </div>
                          <div className="mt-2 text-right font-medium text-slate-800 dark:text-white">
                            Subtotal: $
                            {(item.cantidad * item.precio).toFixed(2)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Product catalog */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full flex flex-col transition-all">
                <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                  Catálogo de Productos
                </h2>

                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    data-search="true"
                    placeholder="Buscar productos..."
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length > 0) {
                        setShowSearchResults(true);
                      } else {
                        setShowSearchResults(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchTerm.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        buscarProductoPorCodigo();
                      }
                    }}
                  />
                  <button
                    data-search="true"
                    onClick={buscarProductoPorCodigo}
                    className="mt-2 w-full bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 py-2 rounded-full hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Buscar por Código
                  </button>
                </div>

                {loading ? (
                  <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : productos.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <p>No hay productos disponibles</p>
                  </div>
                ) : showSearchResults ? (
                  <div
                    ref={searchResultsRef}
                    className="flex-grow overflow-y-auto bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-md absolute z-10 left-0 right-0 mx-6 p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Resultados de búsqueda
                      </h3>
                      <button
                        onClick={() => setShowSearchResults(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {productosFiltrados.length === 0 ? (
                      <div className="py-4 text-center text-slate-500 dark:text-slate-400">
                        <p>No se encontraron productos</p>
                      </div>
                    ) : (
                      <ul className="grid grid-cols-1 gap-2">
                        {productosFiltrados.slice(0, 5).map((producto) => (
                          <li
                            key={producto.Cod_Producto}
                            className="border border-slate-200 dark:border-gray-700 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => agregarProducto(producto)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2">
                                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-white">
                                    {producto.Nombre}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {producto.Cod_Producto}
                                  </p>
                                </div>
                              </div>
                              <button className="p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                                <Plus size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex-grow overflow-y-auto">
                    <ul className="grid grid-cols-1 gap-3">
                      {productosFiltrados.slice(0, 10).map((producto) => (
                        <li
                          key={producto.Cod_Producto}
                          className="border border-slate-200 dark:border-gray-700 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          onClick={() => agregarProducto(producto)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-3">
                                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-white">
                                  {producto.Nombre}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {producto.Marca} - {producto.Categoria}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-emerald-600 dark:text-emerald-500 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {asegurarNumero(producto.Prec_Venta).toFixed(2)}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Stock: {producto.Stock_Actual}
                              </p>
                            </div>
                          </div>
                          <button className="mt-2 w-full flex items-center justify-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                            <Plus size={16} className="mr-1" />
                            <span>Agregar</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NuevaVenta;
