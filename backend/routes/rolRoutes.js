// backend/routes/rolRoutes.js
import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Obtener lista de roles
router.get("/", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;

    if (rol !== "SuperAdmin") {
      return res.status(403).json({
        message: "Acceso denegado: solo SuperAdmin puede ver roles.",
      });
    }

    // 🔹 Traer todos los campos, incluyendo descripción, nivel y permisos
    const result = await pool.query(
      "SELECT id, nombre, descripcion, nivel, permisos FROM roles ORDER BY id ASC;"
    );

    // 🔹 Convertir permisos en array si están guardados como texto
    const roles = result.rows.map((r) => ({
      ...r,
      permisos:
        typeof r.permisos === "string"
          ? JSON.parse(r.permisos)
          : r.permisos || [],
    }));

    res.json(roles);
  } catch (error) {
    console.error("❌ Error obteniendo roles:", error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
});


// ✅ Crear nuevo rol
router.post("/", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado: solo SuperAdmin puede crear roles." });
    }

    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: "El nombre del rol es obligatorio." });

    const result = await pool.query(
      "INSERT INTO roles (nombre) VALUES ($1) RETURNING *;",
      [nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creando rol:", error);
    res.status(500).json({ message: "Error al crear el rol" });
  }
});

// ✅ Actualizar rol
router.put("/:id", verifyToken(["SuperAdmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;

    const result = await pool.query(
      "UPDATE roles SET nombre = $1, descripcion = $2, permisos = $3 WHERE id = $4 RETURNING *;",
      [nombre, descripcion, permisos || [], id]
    );

    res.json({ message: "✏️ Rol actualizado correctamente", rol: result.rows[0] });
  } catch (error) {
    console.error("❌ Error actualizando rol:", error);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
});




// ✅ Eliminar un rol
router.delete("/:id", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado: solo SuperAdmin puede eliminar roles." });
    }

    const { id } = req.params;
    await pool.query("DELETE FROM roles WHERE id = $1;", [id]);
    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando rol:", error);
    res.status(500).json({ message: "Error al eliminar rol" });
  }
});

/* =======================================================
   🧠 Obtener todos los roles con sus permisos asociados
======================================================= */
router.get("/", verifyToken(), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre, descripcion, nivel FROM roles ORDER BY id ASC");

    // Para cada rol, traer los módulos asociados
    const roles = await Promise.all(
      result.rows.map(async (rol) => {
        const modulos = await pool.query(
          `SELECT m.nombre, m.categoria, rm.permiso_lectura, rm.permiso_escritura, rm.permiso_admin
           FROM roles_modulos rm
           JOIN modulos m ON m.id = rm.modulo_id
           WHERE rm.rol_id = $1`,
          [rol.id]
        );

        return { ...rol, permisos: modulos.rows };
      })
    );

    res.json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
});

/* =======================================================
   🧱 Obtener todos los módulos disponibles
======================================================= */
router.get("/modulos", verifyToken(), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modulos WHERE activo = TRUE ORDER BY categoria, nombre;");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo módulos:", error);
    res.status(500).json({ message: "Error al obtener módulos" });
  }
});

/* =======================================================
   🔗 Obtener los permisos de un rol específico
======================================================= */
router.get("/:id/permisos", verifyToken(), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT m.nombre, m.categoria, rm.permiso_lectura, rm.permiso_escritura, rm.permiso_admin
       FROM roles_modulos rm
       JOIN modulos m ON m.id = rm.modulo_id
       WHERE rm.rol_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo permisos:", error);
    res.status(500).json({ message: "Error al obtener permisos" });
  }
});


export default router;
