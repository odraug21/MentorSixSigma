// backend/middleware/auth.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Falta token de autorización" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol, ... }
    return next();
  } catch (err) {
    console.error("❌ Error en verifyToken:", err?.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};
