"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  ShoppingCart,
  Eye,
  Calendar,
  DollarSign,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

export const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [cargando, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("date_desc");

  // Referencia para el modal de filtros
  const filtroRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    // Obtener el token de autenticación desde localStorage
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/ventas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        return respuesta.json();
      })
      .then((datos) => {
        // Asegurarse de que los datos sean un array
        const ventasArray = Array.isArray(datos) ? datos : [];
        setVentas(ventasArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar ventas:", error);
        setError(error.message);
        // En caso de error, establecer ventas como un array vacío
        setVentas([]);
        setLoading(false);
      });
  }, []);

  // Manejador para cerrar el modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filtroRef.current &&
        !filtroRef.current.contains(event.target) &&
        !event.target.closest('button[data-filter-toggle="true"]')
      ) {
        setFiltroAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtroRef]);

  // Filtrar y ordenar ventas
  const ventasFiltradas = ventas
    .filter((venta) => {
      const cliente = (venta.Nombre_Cliente || "").toLowerCase();
      const busquedaEnMinuscula = terminoBusqueda.toLowerCase();
      let cumpleFechaDesde = true;
      let cumpleFechaHasta = true;

      if (fechaDesde) {
        cumpleFechaDesde = new Date(venta.Fecha) >= new Date(fechaDesde);
      }
      if (fechaHasta) {
        cumpleFechaHasta = new Date(venta.Fecha) <= new Date(fechaHasta);
      }

      return (
        cliente.includes(busquedaEnMinuscula) &&
        cumpleFechaDesde &&
        cumpleFechaHasta
      );
    })
    .sort((a, b) => {
      if (ordenarPor === "date_desc") {
        return new Date(b.Fecha) - new Date(a.Fecha);
      }
      if (ordenarPor === "date_asc") {
        return new Date(a.Fecha) - new Date(b.Fecha);
      }
      if (ordenarPor === "total_desc") {
        return Number.parseFloat(b.Total) - Number.parseFloat(a.Total);
      }
      if (ordenarPor === "total_asc") {
        return Number.parseFloat(a.Total) - Number.parseFloat(b.Total);
      }
      return 0;
    });

  // Paginación
  const indiceDelUltimoElemento = paginaActual * elementosPorPagina;
  const indiceDelPrimerElemento = indiceDelUltimoElemento - elementosPorPagina;
  const elementosActuales = ventasFiltradas.slice(
    indiceDelPrimerElemento,
    indiceDelUltimoElemento
  );
  const totalDePaginas = Math.ceil(ventasFiltradas.length / elementosPorPagina);

  // Formatear fecha de manera simple y directa
  const formatearFecha = (cadenaFecha) => {
    if (!cadenaFecha) return "Fecha no disponible";

    try {
      // Si es un formato MySQL (YYYY-MM-DD HH:MM:SS)
      if (
        typeof cadenaFecha === "string" &&
        cadenaFecha.includes("-") &&
        cadenaFecha.includes(":")
      ) {
        const [parteFecha, parteTiempo] = cadenaFecha.split(" ");
        const [año, mes, dia] = parteFecha.split("-");
        const [horas, minutos] = parteTiempo.split(":");

        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
      }

      return cadenaFecha;
    } catch (error) {
      console.error("Error al formatear fecha:", error, cadenaFecha);
      return cadenaFecha; // Devolver la fecha original si hay un error
    }
  };

  const aplicarFiltros = () => {
    setPaginaActual(1);
    setFiltroAbierto(false);
  };

  const limpiarFiltros = () => {
    setTerminoBusqueda("");
    setFechaDesde("");
    setFechaHasta("");
    setOrdenarPor("date_desc");
    setPaginaActual(1);
  };

  // Función para generar array de páginas para la paginación mejorada
  const getPaginationRange = () => {
    const delta = 1; // Número de páginas a mostrar antes y después de la página actual
    const range = [];

    // Siempre mostrar la primera página
    range.push(1);

    // Calcular el rango de páginas a mostrar
    const rangeStart = Math.max(2, paginaActual - delta);
    const rangeEnd = Math.min(totalDePaginas - 1, paginaActual + delta);

    // Agregar puntos suspensivos después de la primera página si es necesario
    if (rangeStart > 2) {
      range.push("...");
    }

    // Agregar páginas del rango calculado
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    // Agregar puntos suspensivos antes de la última página si es necesario
    if (rangeEnd < totalDePaginas - 1) {
      range.push("...");
    }

    // Siempre mostrar la última página si hay más de una página
    if (totalDePaginas > 1) {
      range.push(totalDePaginas);
    }

    return range;
  };

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Listado de Ventas
            </h1>

            <Link
              to="/ventas/nueva"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-full shadow hover:shadow-lg transition-all"
            >
              <PlusCircle size={18} className="mr-2" />
              <span>Nueva Venta</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
              </div>
              <button
                data-filter-toggle="true"
                onClick={() => setFiltroAbierto(!filtroAbierto)}
                className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded-full transition-colors"
              >
                <Filter size={18} className="mr-2" />
                <span>Filtros</span>
              </button>
            </div>

            {filtroAbierto && (
              <div
                ref={filtroRef}
                className="mt-3 p-4 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/50 relative shadow-lg"
              >
                <button
                  onClick={() => setFiltroAbierto(false)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Cerrar filtros"
                >
                  <X size={18} className="text-slate-500 dark:text-slate-400" />
                </button>

                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Filtros avanzados
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Fecha desde
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Fecha hasta
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Ordenar por
                    </label>
                    <select
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                    >
                      <option value="date_desc">Fecha (más reciente)</option>
                      <option value="date_asc">Fecha (más antigua)</option>
                      <option value="total_desc">Total (mayor)</option>
                      <option value="total_asc">Total (menor)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={limpiarFiltros}
                    className="inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-slate-700 dark:text-slate-200 rounded-full transition-colors mr-2"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={aplicarFiltros}
                    className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow hover:shadow-lg transition-all"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {cargando ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-6 text-red-700 dark:text-red-400">
              <p>Error: {error}</p>
              <p className="mt-2">
                Verifica que el servidor esté funcionando correctamente.
              </p>
            </div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-slate-500 dark:text-slate-400">
              <p>No se encontraron ventas</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                    <thead className="bg-slate-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Productos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                      {elementosActuales.map((venta) => (
                        <tr
                          key={venta.Id_Venta}
                          className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
                              <span className="text-sm text-slate-900 dark:text-white">
                                {formatearFecha(venta.Fecha)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-2" />
                              <span className="text-sm text-slate-900 dark:text-white">
                                {venta.Nombre_Cliente || "Cliente General"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                ${Number.parseFloat(venta.Total).toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                              {venta.Detalles ? venta.Detalles.length : 0}{" "}
                              productos
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/ventas/${venta.Id_Venta}`}
                              className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-500 dark:hover:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span>Ver Detalles</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación Mejorada y Moderna */}
              {ventasFiltradas.length > 0 && totalDePaginas > 1 && (
                <div className="flex justify-center items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                  <nav
                    className="flex items-center space-x-2"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setPaginaActual((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={paginaActual === 1}
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {getPaginationRange().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-slate-500 dark:text-slate-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${page}`}
                            onClick={() => setPaginaActual(Number(page))}
                            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                              paginaActual === page
                                ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200"
                            }`}
                            aria-current={
                              paginaActual === page ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPaginaActual((prev) =>
                          Math.min(prev + 1, totalDePaginas)
                        )
                      }
                      disabled={paginaActual === totalDePaginas}
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Ventas;
