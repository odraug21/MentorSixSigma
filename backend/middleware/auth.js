import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "Token no entregado" });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token vacío" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, email, rol, empresa_id }
    next();

  } catch (error) {
    console.error("❌ Error en verifyToken:", error);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};
