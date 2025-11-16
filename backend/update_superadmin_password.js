// update_superadmin_password.js
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

const email = "super@mentor.com";
const newPassword = "1234";

const updatePassword = async () => {
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    console.log("🔐 Nuevo hash generado:", hash);

    const result = await pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE email = $2",
      [hash, email]
    );

    console.log("✅ Contraseña actualizada correctamente para", email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error actualizando contraseña:", err);
    process.exit(1);
  }
};

updatePassword();
