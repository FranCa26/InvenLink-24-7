"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  Lock,
  User,
  AlertCircle,
  Info,
  Shield,
} from "lucide-react";
import { ThemeProvider } from "../../components/theme-provider";
import { ThemeToggle } from "../../components/theme-toggle";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  
  const from = location.state?.from?.pathname || "/";

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // If the response is not successful, handle different types of errors
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "El servidor no está configurado para autenticación. Contacte al administrador."
          );
        }

        const data = await response.json();
        throw new Error(data.message || "Error al iniciar sesión");
      }

      const data = await response.json();

     
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      
      navigate(from, { replace: true });

      
      window.location.reload();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-6 py-8 text-white text-center">
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Bienvenido al Sistema</h1>
              <p className="mt-2 text-emerald-100">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <div className="p-6 dark:text-white">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md p-4 mb-6 text-red-700 dark:text-red-400">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500 dark:text-red-400" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Nombre de Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                      placeholder="Ingresa tu usuario"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white transition-all"
                      required
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all transform hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>

              
              {showTip && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-md p-4 text-blue-800 dark:text-blue-300 opacity-0 animate-fadeIn">
                  <div className="flex">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">
                        Recomendación de seguridad
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Asegúrate de cerrar sesión cuando termines de usar el
                        sistema, especialmente en dispositivos compartidos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

             
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-gray-700 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>© 2025 Sistema de Inventario</p>
                <p className="mt-1">Todos los derechos reservados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Login;
