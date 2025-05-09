import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"), // Carpeta donde Vite guardará el build
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"), // Asegura que tome el archivo correcto
    },
  },
});
