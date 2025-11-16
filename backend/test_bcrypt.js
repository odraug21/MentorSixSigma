// test_bcrypt.js
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

const email = "super@mentor.com";

const testPassword = async () => {
  try {
    // 1️⃣ Buscar el hash actual del usuario
    const { rows } = await pool.query(
      "SELECT password_hash FROM usuarios WHERE email = $1 LIMIT 1;",
      [email]
    );

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado en la base de datos");
      process.exit(0);
    }

    const hash = rows[0].password_hash;
    console.log("🔍 Hash encontrado:", hash);

    // 2️⃣ Comparar con la contraseña 1234
    const match = await bcrypt.compare("1234", hash);

    if (match) {
      console.log("✅ La contraseña '1234' COINCIDE con el hash guardado");
    } else {
      console.log("❌ La contraseña '1234' NO coincide con el hash guardado");
    }

    process.exit(0);
  } catch (err) {
    console.error("⚠️ Error durante la prueba:", err);
    process.exit(1);
  }
};

testPassword();
