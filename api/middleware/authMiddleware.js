require("dotenv").config();
const jwt = require("jsonwebtoken");
// Clave secreta para verificar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_predeterminada";

// Middleware para verificar token JWT
exports.verificarToken = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. Token no proporcionado.",
    });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Guardar los datos del usuario en el objeto de solicitud
    req.usuario = decoded;

    // Continuar con la siguiente función en la cadena
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

// Middleware para verificar rol de administrador
exports.esAdmin = (req, res, next) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.usuario && req.usuario.rol === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere rol de administrador.",
    });
  }
};
