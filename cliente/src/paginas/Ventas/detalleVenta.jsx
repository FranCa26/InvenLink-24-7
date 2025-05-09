"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Calendar,
  User,
  DollarSign,
  Package,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

export const DetalleVenta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/ventas/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setVenta(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar detalles de la venta:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  // Formatear fecha de manera simple y directa
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      // Si es un formato MySQL (YYYY-MM-DD HH:MM:SS)
      if (
        typeof dateString === "string" &&
        dateString.includes("-") &&
        dateString.includes(":")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        const [hours, minutes] = timePart.split(":");

        const meses = [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ];

        const nombreMes = meses[Number.parseInt(month) - 1];

        return `${day} de ${nombreMes} de ${year}, ${hours}:${minutes}`;
      }

      return dateString;
    } catch (error) {
      console.error("Error al formatear fecha:", error, dateString);
      return dateString; // Devolver la fecha original si hay error
    }
  };

  // Imprimir comprobante
  const imprimirComprobante = () => {
    window.print();
  };

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
              <p>Error: {error}</p>
              <p className="mt-2">
                No se pudo cargar los detalles de la venta.
              </p>
              <button
                onClick={() => navigate("/ventas")}
                className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Volver a Ventas
              </button>
            </div>
          ) : !venta ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 text-yellow-700 dark:text-yellow-400">
              <p>La venta solicitada no existe.</p>
              <button
                onClick={() => navigate("/ventas")}
                className="mt-4 px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-full hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors"
              >
                Volver a Ventas
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                  <ShoppingCart className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                  Detalle de Venta #{venta.Id_Venta}
                </h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate("/ventas")}
                    className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    <span>Volver</span>
                  </button>
                  <button
                    onClick={imprimirComprobante}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors"
                  >
                    <Printer size={18} className="mr-2" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Información de la venta */}
                <div className="md:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 transition-all">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-white border-b border-slate-200 dark:border-gray-700 pb-2">
                      Información de la Venta
                    </h2>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Fecha
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatDate(venta.Fecha)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <User className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Cliente
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {venta.Nombre_Cliente || "Cliente General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Método de Pago
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {venta.Metodo_Pago || "Efectivo"}
                        </p>
                      </div>
                    </div>

                    {venta.Observaciones && (
                      <div className="pt-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Observaciones
                        </p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">
                          {venta.Observaciones}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                      <div className="flex justify-between items-center text-lg font-medium">
                        <span className="text-slate-700 dark:text-slate-300">
                          Total:
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1 rounded-full">
                          ${Number.parseFloat(venta.Total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles de la venta */}
                <div className="md:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all">
                    <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                        Productos Vendidos
                      </h2>
                    </div>

                    {venta.Detalles && venta.Detalles.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                          <thead className="bg-slate-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Producto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Precio Unitario
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Cantidad
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Subtotal
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                            {venta.Detalles.map((detalle, index) => (
                              <tr
                                key={index}
                                className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                      <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                                        {detalle.Nombre_Producto || "Producto"}
                                      </div>
                                      <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {detalle.Cod_Producto}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
                                    <span className="text-sm text-slate-900 dark:text-white">
                                      {Number.parseFloat(
                                        detalle.Precio_Unitario
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                    {detalle.Cantidad}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                  $
                                  {(
                                    detalle.Cantidad * detalle.Precio_Unitario
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 dark:bg-gray-700/50">
                            <tr>
                              <td
                                colSpan="3"
                                className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300"
                              >
                                Total:
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-500">
                                ${Number.parseFloat(venta.Total).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                        <p>No hay detalles disponibles para esta venta</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DetalleVenta;
