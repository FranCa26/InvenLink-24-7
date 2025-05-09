const Usuario = require("../models/usuariosModels");
const jwt = require("jsonwebtoken");

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "Hola_Mundo_Cruel";

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se proporcionen las credenciales
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar nombre de usuario y contraseña",
      });
    }

    // Verificar credenciales
    const resultado = await Usuario.verificarCredenciales(username, password);

    if (!resultado.success) {
      return res.status(401).json({
        success: false,
        message: resultado.message,
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: resultado.usuario.Id_Usuario,
        username: resultado.usuario.Username,
        rol: resultado.usuario.Rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" } // El token expira en 8 horas
    );

    // Enviar respuesta exitosa con token y datos del usuario
    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      usuario: resultado.usuario,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: err.message,
    });
  }
};

// Registro de usuario (solo para administradores)
exports.register = async (req, res) => {
  try {
    const { username, password, nombre, rol } = req.body;

    // Validar que se proporcionen los datos necesarios
    if (!username || !password || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar nombre de usuario, contraseña y nombre",
      });
    }

    // Crear el nuevo usuario
    const resultado = await Usuario.create({
      Username: username,
      Password: password,
      Nombre: nombre,
      Rol: rol || "vendedor", // Rol por defecto
    });

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: resultado.message,
      });
    }

    // Enviar respuesta exitosa
    return res.status(201).json({
      success: true,
      message: resultado.message,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: err.message,
    });
  }
};

// Verificar token (para comprobar si el usuario está autenticado)
exports.verificarToken = (req, res) => {
  // Si llega aquí, el middleware de autenticación ya verificó el token
  return res.status(200).json({
    success: true,
    usuario: {
      id: req.usuario.id,
      username: req.usuario.username,
      rol: req.usuario.rol,
    },
  });
};
