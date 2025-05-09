"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export const ActualizarProducto = () => {
  const navigate = useNavigate();
  const { Cod_Producto } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [producto, setProducto] = useState({
    Cod_Producto: "",
    Nombre: "",
    Marca: "",
    Talle: "",
    Categoria: "",
    Stock_Inicial: 0,
    Stock_Actual: 0,
    Precio_Costo: 0,
    Precio_Venta: 0,
    Estado: "",
  });

  useEffect(() => {
    // Check if there's an authenticated user
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    } else {
      // If there's no authenticated user, redirect to the product detail page
      navigate(`/producto/${Cod_Producto}`);
      return;
    }

    const fetchProducto = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/productos/${Cod_Producto}`
        );

        if (!response.ok) {
          throw new Error("No se pudo cargar el producto");
        }
        const data = await response.json();
        setProducto({
          ...data,
          // Handle different property names that might come from the API
          Precio_Costo: data.Precio_Costo || data.Prec_Costo || 0,
          Precio_Venta: data.Precio_Venta || data.Prec_Venta || 0,
        });
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        setError(error.message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProducto();
  }, [Cod_Producto, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the authentication token
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No estás autorizado para realizar esta acción");
      }

      const response = await fetch(
        `http://localhost:5000/api/productos/${Cod_Producto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(producto),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No estás autorizado para actualizar productos");
        }
        throw new Error("Error al actualizar el producto");
      }

      const data = await response.json();
      alert(data.message || "Producto actualizado correctamente");
      navigate(`/producto/${Cod_Producto}`);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {fetchLoading ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 flex flex-col items-center text-red-700 dark:text-red-400">
              <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => navigate(`/producto/${Cod_Producto}`)}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Volver al detalle
              </button>
            </div>
          ) : !usuario ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 flex flex-col items-center text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-12 w-12 text-amber-500 dark:text-amber-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
              <p className="mb-4">
                Debes iniciar sesión para editar productos.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-full hover:bg-amber-700 dark:hover:bg-amber-800 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Package className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                  Editar Producto
                </h1>

                <button
                  onClick={() => navigate(`/producto/${Cod_Producto}`)}
                  className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Volver al detalle</span>
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Modificar Información del Producto
                  </h2>
                  <p className="text-emerald-100">
                    Código: {producto.Cod_Producto}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                          <Tag className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                          Código del Producto
                        </label>
                        <input
                          type="text"
                          name="Cod_Producto"
                          value={producto.Cod_Producto}
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-slate-100 dark:bg-gray-700 cursor-not-allowed text-slate-500 dark:text-slate-400"
                          readOnly
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          El código no puede ser modificado
                        </p>
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
                          Stock Inicial
                        </label>
                        <input
                          type="number"
                          name="Stock_Inicial"
                          value={producto.Stock_Inicial}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                          <Layers className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                          Stock Actual
                        </label>
                        <input
                          type="number"
                          name="Stock_Actual"
                          value={producto.Stock_Actual}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                          Precio de Costo
                        </label>
                        <input
                          type="number"
                          name="Precio_Costo"
                          value={producto.Precio_Costo}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-500" />
                          Precio de Venta
                        </label>
                        <input
                          type="number"
                          name="Precio_Venta"
                          value={producto.Precio_Venta}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
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
                          placeholder="Ej: Disponible"
                          className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/producto/${Cod_Producto}`)}
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
                          <span>Actualizando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span>Actualizar Producto</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ActualizarProducto;
