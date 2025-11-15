// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import rolesModulosRoutes from "./routes/rolesModulosRoutes.js";
import rolRoutes from "./routes/rolRoutes.js";
import modulosRoutes from "./routes/modulosRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import consultasRoutes from "./routes/consultasRoutes.js";
import a3Routes from "./routes/a3Routes.js";
import geminiIA from "./api/geminiIA.js";

dotenv.config();
const app = express();

// 🌍 CORS flexible y seguro
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (ej: Postman) o dominios de desarrollo/producción
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("vercel.app") ||
        origin.includes("mentorsuites.com")
      ) {
        return callback(null, true);
      }
      console.warn("🚫 CORS bloqueado para:", origin);
      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧠 Middleware simple de logging
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ✅ Rutas
app.get("/", (_req, res) =>
  res.json({ message: "Servidor MentorSuites activo 🚀" })
);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/roles-modulos", rolesModulosRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/modulos", modulosRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/consultas", consultasRoutes);
app.use("/api/a3", a3Routes);
app.use("/api/geminiIA", geminiIA);

// 🧭 Ruta de prueba del backend (útil en Vercel)
app.get("/api", (_req, res) =>
  res.json({ status: "✅ Backend activo en Vercel", time: new Date().toISOString() })
);

// 404 genérico
app.use((_req, res) => res.status(404).json({ message: "Ruta no encontrada" }));

// ⚙️ Exportar para Serverless (Vercel)
export default app;

// 🖥️ Ejecutar solo en local
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 MentorSuites API corriendo en http://localhost:${PORT}`)
  );
}
