"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
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

export const ProductoDetalle = () => {
  const { Cod_Producto } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an authenticated user
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/productos/${Cod_Producto}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }
        return response.json();
      })
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar el producto:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [Cod_Producto]);

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 text-red-700 dark:text-red-400">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-500 dark:text-red-400" />
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-full"
              >
                Volver al listado
              </button>
            </div>
          ) : !producto ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 text-yellow-700 dark:text-yellow-400">
              <p>El producto solicitado no existe.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-full hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors"
              >
                Volver al listado
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Volver al listado</span>
                </button>

                {usuario && (
                  <Link
                    to={`/editar/${producto.Cod_Producto}`}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-full shadow hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Editar Producto</span>
                  </Link>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    {producto.Nombre}
                  </h2>
                  <p className="text-emerald-100">
                    Código: {producto.Cod_Producto}
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Marca:
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {producto.Marca || "No especificada"}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Bookmark className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Categoría:
                        </span>
                        <span className="ml-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-full text-sm">
                          {producto.Categoria || "No especificada"}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <BarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Talle:
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {producto.Talle || "No especificado"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Stock Inicial:
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {producto.Stock_Inicial}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Stock Actual:
                        </span>
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-sm ${
                            producto.Stock_Actual > 10
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : producto.Stock_Actual > 0
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}
                        >
                          {producto.Stock_Actual}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Precio de Costo:
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          ${producto.Prec_Costo || producto.Precio_Costo}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Precio de Venta:
                        </span>
                        <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-500">
                          ${producto.Prec_Venta || producto.Precio_Venta}
                        </span>
                      </div>
                    </div>
                  </div>

                  {producto.Estado && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        Estado
                      </h3>
                      <p
                        className={`mt-2 px-4 py-2 inline-block rounded-full ${
                          producto.Estado === "Disponible"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}
                      >
                        {producto.Estado}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ProductoDetalle;
