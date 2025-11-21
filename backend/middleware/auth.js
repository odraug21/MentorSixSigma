// ============================================================
// 📌 auth.js — verifyToken optimizado
// 🚀 Valida el token sin tocar la base de datos
// ============================================================

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No se proporcionó token." });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Decodificación correcta
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      empresa_id: decoded.empresa_id,
    };

    return next();

  } catch (error) {
    console.error("❌ Error en verifyToken:", error.message);
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
