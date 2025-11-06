// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Verificación de roles
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
};

