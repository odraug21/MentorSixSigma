// backend/routes/usuariosRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Obtener lista de roles (solo para SuperAdmin)
router.get("/roles", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;

    if (rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado: solo SuperAdmin puede ver roles." });
    }

    const result = await pool.query("SELECT id, nombre FROM roles ORDER BY id ASC;");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo roles:", error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
});

// ✅ Obtener lista de empresas (para SuperAdmin)
router.get("/empresas", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;

    if (rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado: solo SuperAdmin puede ver empresas." });
    }

    const result = await pool.query("SELECT id, nombre FROM empresas ORDER BY id ASC;");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo empresas:", error);
    res.status(500).json({ message: "Error al obtener empresas" });
  }
});

// ✅ Obtener todos los usuarios (según rol)
router.get("/", verifyToken(), async (req, res) => {
  try {
    const { rol, empresa } = req.user;

    let query = `
      SELECT u.id, u.nombre, u.email, r.nombre AS rol, e.nombre AS empresa
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      JOIN empresas e ON e.id = u.empresa_id
    `;

    // 🔐 Filtrar por empresa si NO es SuperAdmin
    const params = [];
    if (rol !== "SuperAdmin") {
      query += " WHERE e.nombre = $1";
      params.push(empresa);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// ✅ Crear nuevo usuario (solo SuperAdmin o AdminEmpresa)
router.post("/", verifyToken(), async (req, res) => {
  try {
    const { rol, empresa: empresaSesion } = req.user;
    const { nombre, email, password, empresa_id, rol_id } = req.body;

    // Validaciones de permisos
    if (rol !== "SuperAdmin" && rol !== "AdminEmpresa") {
      return res.status(403).json({ message: "No tienes permiso para crear usuarios." });
    }

    // Si el rol es AdminEmpresa, debe crear solo usuarios de su misma empresa
    if (rol === "AdminEmpresa") {
      const empresaRes = await pool.query("SELECT id FROM empresas WHERE nombre = $1", [empresaSesion]);
      if (empresaRes.rows.length === 0 || empresaRes.rows[0].id !== empresa_id) {
        return res.status(403).json({ message: "Solo puedes crear usuarios dentro de tu empresa." });
      }
    }

    // Validar si el email ya existe
    const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, empresa_id, rol_id, activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING id, nombre, email, empresa_id, rol_id;`,
      [nombre, email, password_hash, empresa_id, rol_id]
    );

    res.status(201).json({
      message: "✅ Usuario creado correctamente",
      usuario: insert.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
});


// ✅ Editar usuario
router.put("/:id", verifyToken(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, empresa_id, rol_id } = req.body;

    const fields = ["nombre", "email", "empresa_id", "rol_id"];
    const values = [nombre, email, empresa_id, rol_id];
    let setQuery = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

    // Si envía nueva contraseña, se encripta y se agrega
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      setQuery += `, password_hash = '${password_hash}'`;
    }

    const result = await pool.query(
      `UPDATE usuarios SET ${setQuery} WHERE id = ${id} RETURNING id, nombre, email;`,
      values
    );

    res.json({ message: "✏️ Usuario actualizado", usuario: result.rows[0] });
  } catch (error) {
    console.error("❌ Error editando usuario:", error);
    res.status(500).json({ message: "Error al editar usuario" });
  }
});

// ✅ Eliminar usuario
router.delete("/:id", verifyToken(), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios WHERE id = $1;", [id]);
    res.json({ message: "🗑️ Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

// ✅ Cambiar estado activo/inactivo
router.patch("/:id/activo", verifyToken(), async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const result = await pool.query(
      "UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo;",
      [activo, id]
    );

    res.json({
      message: `Usuario ${activo ? "activado" : "desactivado"} correctamente`,
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error);
    res.status(500).json({ message: "Error al actualizar estado de usuario" });
  }
});



export default router;
