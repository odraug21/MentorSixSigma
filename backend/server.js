// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import rolesModulosRoutes from "./routes/rolesModulosRoutes.js";
import evidenciasRoutes from "./routes/fiveSEvidenciasRoutes.js";
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

dotenv.config();

const app = express();
app.use(express.json());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://mentorsuites.com",
  "https://www.mentorsuites.com"
];

// CORS universal
app.use(cors({
  origin: (origin, callback) => {
    // Permite Postman, Thunder Client, SSR, etc.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("❌ CORS bloqueado para origen: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Logging
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Rutas
app.get("/", (_req, res) => res.json({ message: "Servidor MentorSuites activo 🚀" }));

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
app.use("/api/5s", fiveSRoutes);
app.use("/api/evidencias", evidenciasRoutes);
app.use("/api/5s/implementacion", fiveSImplementacionRoutes);
app.use("/api/5s", fiveSTareasRoutes);
app.use("/api/5s", fiveSSubtareasRoutes);
app.use("/api/5s/evidencias", fiveSEvidenciasRoutes);



// ======================================================
// HEALTH CHECK (debe ir antes del 404)
// ======================================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "MentorSuites backend activo 🚀"
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

// ✔ PERMITIMOS app.listen SOLO EN LOCAL
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 MentorSuites API corriendo en puerto ${PORT}`)
  );
}


