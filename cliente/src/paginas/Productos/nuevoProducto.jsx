"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Package,
  Tag,
  Bookmark,
  BarChart2,
  DollarSign,
  ShoppingCart,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

export const NuevoProducto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [producto, setProducto] = useState({
    Cod_Producto: "",
    Nombre: "",
    Marca: "",
    Talle: "",
    Categoria: "",
    Stock_Inicial: 0,
    Stock_Actual: 0,
    Prec_Costo: 0, // Cambiado de Precio_Costo a Prec_Costo
    Prec_Venta: 0, // Cambiado de Precio_Venta a Prec_Venta
    Estado: "Disponible", // Estado inicial
  });

  // Cuando el Stock Inicial cambia, actualiza el Stock Actual
  useEffect(() => {
    setProducto((prevProducto) => ({
      ...prevProducto,
      Stock_Actual: prevProducto.Stock_Inicial, // El Stock Actual es igual al Stock Inicial
    }));
  }, [producto.Stock_Inicial]);

  // Cuando el Stock Actual cambia, actualiza el Estado
  useEffect(() => {
    setProducto((prevProducto) => ({
      ...prevProducto,
      Estado: prevProducto.Stock_Actual > 0 ? "Disponible" : "Agotado", // Estado basado en el Stock Actual
    }));
  }, [producto.Stock_Actual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agregar el producto");
      }

      const data = await response.json();
      alert(data.message || "Producto agregado correctamente");
      navigate("/");
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <Package className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Agregar Nuevo Producto
            </h1>

            <button
              onClick={() => navigate("/")}
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver al listado</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 text-red-700 dark:text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Información del Nuevo Producto
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Código del Producto *
                    </label>
                    <input
                      type="text"
                      name="Cod_Producto"
                      value={producto.Cod_Producto}
                      onChange={handleChange}
                      placeholder="Ej: PROD001"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Package className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      name="Nombre"
                      value={producto.Nombre}
                      onChange={handleChange}
                      placeholder="Ej: Zapatillas Deportivas"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Bookmark className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Marca
                    </label>
                    <input
                      type="text"
                      name="Marca"
                      value={producto.Marca}
                      onChange={handleChange}
                      placeholder="Ej: Nike"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <BarChart2 className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Talle
                    </label>
                    <input
                      type="text"
                      name="Talle"
                      value={producto.Talle}
                      onChange={handleChange}
                      placeholder="Ej: 42"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Bookmark className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Categoría
                    </label>
                    <input
                      type="text"
                      name="Categoria"
                      value={producto.Categoria}
                      onChange={handleChange}
                      placeholder="Ej: Calzado"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Layers className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Stock Inicial *
                    </label>
                    <input
                      type="number"
                      name="Stock_Inicial"
                      value={producto.Stock_Inicial}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <Layers className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Stock Actual *
                    </label>
                    <input
                      type="number"
                      name="Stock_Actual"
                      value={producto.Stock_Actual}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-100 dark:bg-gray-600 text-slate-900 dark:text-white transition-all cursor-not-allowed"
                      required
                      disabled
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Se actualiza automáticamente según el Stock Inicial
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Precio de Costo *
                    </label>
                    <input
                      type="number"
                      name="Prec_Costo"
                      value={producto.Prec_Costo}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                      Precio de Venta *
                    </label>
                    <input
                      type="number"
                      name="Prec_Venta"
                      value={producto.Prec_Venta}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="Estado"
                      value={producto.Estado}
                      onChange={handleChange}
                      placeholder="Estado del Producto"
                      className={`w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-not-allowed ${
                        producto.Estado === "Disponible"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }`}
                      disabled
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Se actualiza automáticamente según el Stock Actual
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-full text-slate-700 dark:text-slate-300 mr-2 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-full shadow hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors flex items-center ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Guardar Producto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NuevoProducto;
