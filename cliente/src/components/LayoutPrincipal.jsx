"use client";

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  TruckIcon as TruckLoading,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Layout = ({ usuario, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Manejar logout
  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Sistema de Inventario
            </Link>
          </div>

          {/* Información del usuario y botón de logout */}
          <div className="flex items-center space-x-4">
            {usuario ? (
              <>
                <div className="hidden md:flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{usuario.Nombre || usuario.Username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-white hover:text-indigo-200"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-white hover:text-indigo-200"
              >
                <User className="h-5 w-5 mr-1" />
                <span>Iniciar Sesión</span>
              </Link>
            )}

            {/* Botón de menú móvil */}
            <button
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Barra lateral de navegación */}
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } md:block bg-white w-64 shadow-md fixed md:static inset-y-0 left-0 z-50 md:z-0 transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } mt-16 md:mt-0`}
        >
          <nav className="p-4 space-y-2">
            <Link
              to="/ventas"
              className={`flex items-center p-2 rounded-md ${
                location.pathname.startsWith("/ventas")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="h-5 w-5 mr-3" />
              <span>Ventas</span>
            </Link>

            <Link
              to="/productos"
              className={`flex items-center p-2 rounded-md ${
                location.pathname.startsWith("/productos")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Package className="h-5 w-5 mr-3" />
              <span>Productos</span>
            </Link>

            {/* Mostrar enlace a Entradas solo si el usuario está autenticado */}
            {usuario && (
              <Link
                to="/entradas"
                className={`flex items-center p-2 rounded-md ${
                  location.pathname.startsWith("/entradas")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <TruckLoading className="h-5 w-5 mr-3" />
                <span>Entradas</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
