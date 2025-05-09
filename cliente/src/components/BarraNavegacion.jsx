"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Package,
  TruckIcon as TruckLoading,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ThemeProvider } from "./theme-provider";

export const BarraNavegacion = ({ usuario }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Efecto de desplazamiento
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manejador para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('button[data-menu="true"]')
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
    window.location.reload();
  };

  return (
    <ThemeProvider>
      <nav
        className={`fixed w-full z-10 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <LayoutDashboard className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                <span>InvenLink 24/7</span>
              </Link>
            </div>

            {/* Menú de navegación para pantallas medianas y grandes */}
            <div className="hidden md:flex space-x-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
              >
                <Package className="h-4 w-4 mr-1.5" />
                <span>Productos</span>
              </Link>
              <Link
                to="/ventas"
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                <span>Ventas</span>
              </Link>
              {usuario && (
                <Link
                  to="/entradas"
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
                >
                  <TruckLoading className="h-4 w-4 mr-1.5" />
                  <span>Entradas</span>
                </Link>
              )}
            </div>

            {/* Información del usuario y botón de cierre de sesión */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />

              {usuario ? (
                <>
                  <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200">
                    <User className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-500" />
                    <span>{usuario.Nombre || usuario.Username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-red-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>

            {/* Botón de menú para móviles */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                data-menu="true"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Alternar menú"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {menuOpen && (
            <div
              ref={menuRef}
              className="md:hidden py-3 space-y-2 border-t border-slate-200 dark:border-gray-700 animate-fadeIn"
            >
              <Link
                to="/"
                className="block px-4 py-2 rounded-full text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <Package className="h-5 w-5 mr-2" />
                <span>Productos</span>
              </Link>
              <Link
                to="/ventas"
                className="block px-4 py-2 rounded-full text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>Ventas</span>
              </Link>
              {usuario && (
                <Link
                  to="/entradas"
                  className="block px-4 py-2 rounded-full text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-emerald-400 dark:hover:bg-gray-800 transition-all duration-200 flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <TruckLoading className="h-5 w-5 mr-2" />
                  <span>Entradas</span>
                </Link>
              )}

              {usuario ? (
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-500" />
                    <span>{usuario.Nombre || usuario.Username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-full text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-2 mt-2 rounded-full text-base font-medium bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white transition-all duration-200 flex items-center justify-center shadow-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </ThemeProvider>
  );
};

export default BarraNavegacion;
