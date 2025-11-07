import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import rolRoutes from "./routes/rolRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import modulosRoutes from "./routes/modulosRoutes.js";
import rolesModulosRoutes from "./routes/rolesModulosRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import consultasRoutes from "./routes/consultasRoutes.js";


console.log("🟢 authRoutes conectado correctamente en runtime");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10mb", type: "application/json; charset=utf-8" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

 
// Registro para rutas
app.use("/api/auth", authRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/modulos", modulosRoutes);
app.use("/api/roles-modulos", rolesModulosRoutes);
app.use("/api/contacto", contactRoutes);
app.use("/api/consultas", consultasRoutes);



app.get("/", (_req, res) => res.send("✅ API MentorSuites operativa"));

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  try {
    const now = await pool.query("SELECT NOW()");
    console.log("✅ Conectado a PostgreSQL:", now.rows[0]);
  } catch (err) {
    console.error("❌ Error conectando a la base de datos:", err);
  }
});
