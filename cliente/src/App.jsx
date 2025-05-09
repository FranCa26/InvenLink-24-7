"use client";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { Productos } from "./paginas/Productos/Productos";
import { ProductoDetalle } from "./paginas/Productos/detalleProducto";
import { NuevoProducto } from "./paginas/Productos/nuevoProducto";
import { ActualizarProducto } from "./paginas/Productos/actualizarProducto";
import { Ventas } from "./paginas/Ventas/Ventas";
import { BarraNavegacion } from "./components/BarraNavegacion";
import { NuevaVenta } from "./paginas/Ventas/nuevaVenta";
import { DetalleVenta } from "./paginas/Ventas/detalleVenta";
import { Entradas } from "./paginas/Entradas/Entradas";
import { DetalleEntrada } from "./paginas/Entradas/detalleEntrada";
import { NuevaEntrada } from "./paginas/Entradas/nuevaEntrada";
import { Login } from "./paginas/Login/inicioSesion";
import { ProtectedRoute } from "./components/RutaProtegidas";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
          <BarraNavegacion usuario={usuario} />
          <div className="container mx-auto px-4 md:px-6">
            <Routes>
              {/* Ruta de login */}
              <Route path="/login" element={<Login />} />

              {/* Rutas públicas */}
              <Route path="/" element={<Productos />} />
              <Route
                path="/producto/:Cod_Producto"
                element={<ProductoDetalle />}
              />
              <Route path="/agregar" element={<NuevoProducto />} />
              <Route
                path="/editar/:Cod_Producto"
                element={<ActualizarProducto />}
              />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/ventas/nueva" element={<NuevaVenta />} />
              <Route path="/ventas/:id" element={<DetalleVenta />} />

              {/* Rutas protegidas */}
              <Route
                path="/entradas"
                element={
                  <ProtectedRoute>
                    <Entradas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entradas/nueva"
                element={
                  <ProtectedRoute>
                    <NuevaEntrada />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entradas/:id"
                element={
                  <ProtectedRoute>
                    <DetalleEntrada />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
