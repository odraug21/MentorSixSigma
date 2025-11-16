// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") }); 

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
});

// Test de conexión
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a PostgreSQL (Supabase desde Render)");
    client.release();
  } catch (err) {
    console.error("❌ Error conectando a Supabase:", err.message);
  }
})();

export default pool;
