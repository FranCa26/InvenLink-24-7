const pool = require("../config/db.js");
const bcrypt = require("bcrypt");

class Usuario {
  // Obtener usuario por nombre de usuario
  static async getByUsername(username) {
    let conn;
    try {
      conn = await pool.getConnection();

      const query = "SELECT * FROM usuarios WHERE Username = ?";
      const rows = await conn.query(query, [username]);

      if (!rows || rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      console.error(
        `Modelo: Error al buscar usuario con username ${username}:`,
        err
      );
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Verificar credenciales de usuario
  static async verificarCredenciales(username, password) {
    try {
      const usuario = await this.getByUsername(username);

      if (!usuario) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Comparar la contraseña proporcionada con la almacenada
      const passwordMatch = await bcrypt.compare(password, usuario.Password);

      if (!passwordMatch) {
        return { success: false, message: "Contraseña incorrecta" };
      }

      // Convertir BigInt a String si es necesario
      return {
        success: true,
        usuario: {
          Id_Usuario: usuario.Id_Usuario.toString(), // Convertir BigInt a String
          Username: usuario.Username,
          Nombre: usuario.Nombre,
          Rol: usuario.Rol,
        },
      };
    } catch (err) {
      console.error("Modelo: Error al verificar credenciales:", err);
      throw err;
    }
  }

  // Crear un nuevo usuario
  static async create(usuario) {
    let conn;
    try {
      conn = await pool.getConnection();

      // Verificar si el usuario ya existe
      const existeUsuario = await this.getByUsername(usuario.Username);
      if (existeUsuario) {
        return {
          success: false,
          message: "El nombre de usuario ya está en uso",
        };
      }

      // Encriptar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(usuario.Password, saltRounds);

      // Insertar el nuevo usuario
      const query = `
        INSERT INTO usuarios (Username, Password, Nombre, Rol)
        VALUES (?, ?, ?, ?)
      `;

      await conn.query(query, [
        usuario.Username,
        hashedPassword,
        usuario.Nombre,
        usuario.Rol || "vendedor", // Rol por defecto
      ]);

      return { success: true, message: "Usuario creado exitosamente" };
    } catch (err) {
      console.error("Modelo: Error al crear usuario:", err);
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = Usuario;
