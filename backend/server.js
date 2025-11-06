import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

console.log("🟢 authRoutes conectado correctamente en runtime");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
 
// Registro para rutas
app.use("/api/auth", authRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuariosRoutes);

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
