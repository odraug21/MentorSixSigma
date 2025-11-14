// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 Forzar carga del .env del backend (independiente de la raíz)
dotenv.config({ path: path.join(__dirname, ".env") });

const { Pool } = pkg;
const isRender = process.env.PGHOST?.includes("render.com");

console.log("🔍 Variables de entorno leídas:");
console.log({
  PGUSER: process.env.PGUSER,
  PGDATABASE: process.env.PGDATABASE,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGPASSWORD: process.env.PGPASSWORD ? "****" : "❌ No leída",
  SSL: isRender ? "✅ SSL activo (Render)" : "❌ SSL desactivado (Local)",
});

// ✅ Configuración del pool
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  password: String(process.env.PGPASSWORD || "Bayunca*832"),
  database: process.env.PGDATABASE || "mentorsuites",
  port: process.env.PGPORT || 5432,
  client_encoding: "UTF8",
  ssl: isRender ? { require: true, rejectUnauthorized: false } : false,
});

// 🧩 Conexión única limpia
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT current_database(), current_user;");
    console.log("✅ Conectado a PostgreSQL");
    console.log("📡 Base actual:", result.rows[0]);
    client.release();
  } catch (err) {
    if (err.message.includes("server does not support SSL")) {
      console.log("ℹ️ Conexión local detectada (sin SSL). OK.");
    } else {
      console.error("❌ Error conectando a la base de datos:", err.message);
    }
  }
})();

export default pool;
