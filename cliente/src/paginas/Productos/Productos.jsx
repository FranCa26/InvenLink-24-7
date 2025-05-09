"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Package,
  Edit,
  Eye,
  Tag,
  Layers,
  Filter,
  Check,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";

export const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Estados para los filtros avanzados
  const [categoria, setCategoria] = useState("");
  const [nivelStock, setNivelStock] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("nombre");
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para almacenar categorías únicas
  const [categorias, setCategorias] = useState([]);

  // Referencia para el modal de filtros
  const filtroRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejador para cerrar el modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filtroRef.current &&
        !filtroRef.current.contains(event.target) &&
        !event.target.closest('button[data-filter-toggle="true"]')
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtroRef]);

  const cargarDatos = () => {
    // Verificar si hay un usuario autenticado
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }

    setLoading(true);
    fetch("http://localhost:5000/api/productos")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Asegurar que data sea un array
        const productosArray = Array.isArray(data) ? data : [];
        setProductos(productosArray);

        // Extraer categorías únicas para el filtro
        const categoriasUnicas = [
          ...new Set(
            productosArray
              .map((producto) => producto.Categoria)
              .filter((categoria) => categoria && categoria.trim() !== "")
          ),
        ];

        setCategorias(categoriasUnicas);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setError(error.message);
        // En caso de error, establecer productos como un array vacío
        setProductos([]);
        setLoading(false);
      });
  };

  // Función para aplicar los filtros
  const aplicarFiltros = () => {
    setFiltrosAplicados(true);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Función para resetear los filtros
  const resetearFiltros = () => {
    setCategoria("");
    setNivelStock("");
    setOrdenarPor("nombre");
    setOrdenAscendente(true);
    setFiltrosAplicados(false);
    setCurrentPage(1);
  };

  // Función para cambiar la dirección de ordenamiento
  const toggleOrden = () => {
    setOrdenAscendente(!ordenAscendente);
    if (filtrosAplicados) {
      aplicarFiltros();
    }
  };

  // Filtrar y ordenar productos
  const filteredProducts = Array.isArray(productos)
    ? productos
        .filter((producto) => {
          // Filtro por texto (nombre, categoría o marca)
          const nombreMatch = (producto.Nombre || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const categoriaMatch = (producto.Categoria || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const marcaMatch = (producto.Marca || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          const cumpleFiltroTexto = nombreMatch || categoriaMatch || marcaMatch;

          // Filtros avanzados (si están aplicados)
          if (!filtrosAplicados) {
            return cumpleFiltroTexto;
          }

          // Filtro por categoría
          const cumpleCategoria =
            !categoria || producto.Categoria === categoria;

          // Filtro por nivel de stock
          let cumpleStock = true;
          const stockActual = producto.Stock_Actual || 0;

          if (nivelStock === "low") {
            cumpleStock = stockActual >= 0 && stockActual <= 10;
          } else if (nivelStock === "medium") {
            cumpleStock = stockActual > 10 && stockActual <= 50;
          } else if (nivelStock === "high") {
            cumpleStock = stockActual > 50;
          }

          return cumpleFiltroTexto && cumpleCategoria && cumpleStock;
        })
        .sort((a, b) => {
          let comparison = 0;

          // Ordenar según el criterio seleccionado
          switch (ordenarPor) {
            case "nombre":
              comparison = (a.Nombre || "").localeCompare(b.Nombre || "");
              break;
            case "stock":
              comparison = (a.Stock_Actual || 0) - (b.Stock_Actual || 0);
              break;
            case "categoria":
              comparison = (a.Categoria || "").localeCompare(b.Categoria || "");
              break;
            default:
              comparison = (a.Nombre || "").localeCompare(b.Nombre || "");
          }

          // Invertir si el orden es descendente
          return ordenAscendente ? comparison : -comparison;
        })
    : [];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Función para generar array de páginas para la paginación mejorada
  const getPaginationRange = () => {
    const delta = 1; // Número de páginas a mostrar antes y después de la página actual
    const range = [];

    // Siempre mostrar la primera página
    range.push(1);

    // Calcular el rango de páginas a mostrar
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Agregar puntos suspensivos después de la primera página si es necesario
    if (rangeStart > 2) {
      range.push("...");
    }

    // Agregar páginas del rango calculado
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    // Agregar puntos suspensivos antes de la última página si es necesario
    if (rangeEnd < totalPages - 1) {
      range.push("...");
    }

    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <ThemeProvider>
      <div className="pt-20 px-4 md:px-6 pb-6 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <Package className="mr-2 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Listado de Productos
            </h1>

            {/* Mostrar botón de agregar para todos los usuarios */}
            <Link
              to="/agregar"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-full shadow hover:shadow-lg transition-all"
            >
              <PlusCircle size={18} className="mr-2" />
              <span>Agregar Producto</span>
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
                  placeholder="Buscar por nombre, categoría o marca..."
                  className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                data-filter-toggle="true"
                onClick={() => setFilterOpen(!filterOpen)}
                className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded-full transition-colors"
              >
                <Filter size={18} className="mr-2" />
                <span>Filtros</span>
              </button>
            </div>

            {filterOpen && (
              <div
                ref={filtroRef}
                className="mt-3 p-4 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/50 relative shadow-lg"
              >
                <button
                  onClick={() => setFilterOpen(false)}
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
                      Categoría
                    </label>
                    <select
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Nivel de Stock
                    </label>
                    <select
                      className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      value={nivelStock}
                      onChange={(e) => setNivelStock(e.target.value)}
                    >
                      <option value="">Todos los niveles</option>
                      <option value="low">Bajo stock (0-10)</option>
                      <option value="medium">Stock medio (11-50)</option>
                      <option value="high">Stock alto (50+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Ordenar por
                    </label>
                    <div className="flex space-x-2">
                      <select
                        className="flex-1 p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                      >
                        <option value="nombre">Nombre</option>
                        <option value="stock">Stock</option>
                        <option value="categoria">Categoría</option>
                      </select>
                      <button
                        onClick={toggleOrden}
                        className="p-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                        title={
                          ordenAscendente
                            ? "Orden ascendente"
                            : "Orden descendente"
                        }
                      >
                        {ordenAscendente ? (
                          <ArrowUp size={18} />
                        ) : (
                          <ArrowDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={resetearFiltros}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 rounded-full transition-colors"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={aplicarFiltros}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-full shadow hover:shadow-lg transition-all flex items-center"
                  >
                    <Check size={16} className="mr-1" />
                    <span>Aplicar Filtros</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
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
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-slate-500 dark:text-slate-400">
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                    <thead className="bg-slate-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700">
                      {currentItems.map((producto) => (
                        <tr
                          key={producto.Cod_Producto}
                          className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {producto.Nombre || "Sin nombre"}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {producto.Marca || "Sin marca"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                              {producto.Categoria || "Sin categoría"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
                              <span
                                className={`text-sm ${
                                  producto.Stock_Actual > 10
                                    ? "text-green-600 dark:text-green-400"
                                    : producto.Stock_Actual > 0
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {producto.Stock_Actual || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                to={`/producto/${producto.Cod_Producto}`}
                                className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-500 dark:hover:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                <span>Ver</span>
                              </Link>

                              {/* Mostrar botón de editar solo si el usuario está autenticado */}
                              {usuario && (
                                <Link
                                  to={`/editar/${producto.Cod_Producto}`}
                                  className="text-amber-600 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 flex items-center bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full transition-colors"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  <span>Editar</span>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación Mejorada y Moderna */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mt-4">
                  <nav
                    className="flex items-center space-x-2"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
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
                            onClick={() => setCurrentPage(Number(page))}
                            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                              currentPage === page
                                ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200"
                            }`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
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

export default Productos;
