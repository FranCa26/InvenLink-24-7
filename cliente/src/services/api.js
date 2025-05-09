import axios from "axios";

const API_URL = "http://localhost:5000"; // Asegúrate de cambiarlo según tu backend

// Ejemplo de una función para obtener productos
export const api = {
  getProductos: async () => {
    try {
      const response = await axios.get(`${API_URL}/productos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  },
  // Ejemplo de una función para actualizar un producto
  updateProducto: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/productos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  },
};
