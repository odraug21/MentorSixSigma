// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import rolesModulosRoutes from "./routes/rolesModulosRoutes.js";
import fiveSImplementacionRoutes from "./routes/fiveSImplementacionRoutes.js";

import rolRoutes from "./routes/rolRoutes.js";
import modulosRoutes from "./routes/modulosRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import consultasRoutes from "./routes/consultasRoutes.js";
import a3Routes from "./routes/a3Routes.js";
import geminiIA from "./api/geminiIA.js";
import fiveSRoutes from "./routes/fiveSRoutes.js";
import fiveSTareasRoutes from "./routes/fiveSTareasRoutes.js";
import fiveSSubtareasRoutes from "./routes/fiveSSubtareasRoutes.js";
import fiveSEvidenciasRoutes from "./routes/fiveSEvidenciasRoutes.js";
import fiveSAuditoriaRoutes from "./routes/fiveSAuditoriaRoutes.js";

import gembaRoutes from "./routes/gembaRoutes.js";

dotenv.config();

const app = express();

// ======================================================
// 🔧 CORS — versión simple y permisiva (Render + Vercel)
// ======================================================
//
// Para no pelear más con orígenes, dejamos CORS abierto.
// Más adelante, si quieres, lo cerramos por dominio.
//
// Esta configuración SIEMPRE agrega Access-Control-Allow-Origin
// y maneja los OPTIONS (preflight).
//
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware extra para asegurarnos de que todas las respuestas
// tengan los headers CORS adecuados (incluyendo errores).
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    // Preflight: respondemos sin llegar a las rutas
    return res.sendStatus(204);
  }

  next();
});

// ======================================================
// Middlewares generales
// ======================================================
app.use(express.json());

// Logging simple
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ======================================================
// Rutas
// ======================================================

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

app.use("/api/5s/evidencias", fiveSEvidenciasRoutes);
app.use("/api/5s/implementacion", fiveSImplementacionRoutes);
app.use("/api/5s", fiveSTareasRoutes);
app.use("/api/5s", fiveSSubtareasRoutes);
app.use("/api/5s", fiveSRoutes);
app.use("/api/5s/auditoria", fiveSAuditoriaRoutes);

app.use("/api/gemba", gembaRoutes);

// ======================================================
// HEALTH CHECK (debe ir antes del 404)
// ======================================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "MentorSuites backend activo 🚀",
  });
});

// ======================================================
// 404 - NO ENCONTRADA (siempre la última)
// ======================================================
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// ⛔ ATENCIÓN: Vercel NO permite app.listen()
// Por eso lo exportamos:
export default app;

// ✔ PERMITIMOS app.listen SOLO EN LOCAL / RENDER
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 MentorSuites API corriendo en puerto ${PORT}`)
  );
}
