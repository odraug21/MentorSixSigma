// backend/controllers/5sProyectosController.js
import pool from "../db.js";

/**
 * ==========================================
 * 1️⃣ Listar proyectos 5S
 * GET /api/5s/proyectos
 * - Si es usuario normal → solo sus proyectos
 * - Si es SuperAdmin    → puede ver todos
 * ==========================================
 */
export const getProyectos5S = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user;

    let query = `
      SELECT p.*, e.nombre AS empresa_nombre
      FROM proyectos_5s p
      LEFT JOIN empresas e ON e.id = p.empresa_id
    `;
    const params = [];

    if (rol === "SuperAdmin") {
      // SuperAdmin ve todos los proyectos
      query += ` ORDER BY p.fecha_creacion DESC;`;
    } else {
      // Usuario normal: solo sus proyectos
      query += ` WHERE p.usuario_id = $1 ORDER BY p.fecha_creacion DESC;`;
      params.push(usuario_id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo proyectos 5S:", error);
    res.status(500).json({ message: "Error al listar proyectos 5S" });
  }
};

/**
 * ==========================================
 * 2️⃣ Crear proyecto 5S
 * POST /api/5s/proyectos
 * Body: { nombre, area, responsable, fechaInicio, id_empresa? }
 * ==========================================
 */
export const crearProyecto5S = async (req, res) => {
  try {
    const { id: usuario_id, rol, empresa_id: empresaToken } = req.user;
    const { nombre, area, responsable, fechaInicio, id_empresa } = req.body;

    if (!nombre || !area) {
      return res
        .status(400)
        .json({ message: "Nombre y área del proyecto son obligatorios." });
    }

    // 🔹 Determinar empresa_id
    let empresa_id = id_empresa || empresaToken || null;

    // 🟦 Caso especial SuperAdmin:
    // si no tiene empresa asignada, usamos MentorSuitesHQ (ID = 1, ajústalo si es otro)
    if (!empresa_id && rol === "SuperAdmin") {
      empresa_id = 1;
    }

    const result = await pool.query(
      `
      INSERT INTO proyectos_5s 
        (usuario_id, empresa_id, nombre, area, responsable, fecha_inicio, estado, avance)
      VALUES 
        ($1, $2, $3, $4, $5, $6, 'En progreso', 0)
      RETURNING *;
      `,
      [
        usuario_id,
        empresa_id,
        nombre,
        area,
        responsable || null,
        fechaInicio || null,
      ]
    );

    console.log("✅ Proyecto 5S creado:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creando proyecto 5S:", error);
    res.status(500).json({ message: "Error al crear proyecto 5S" });
  }
};

/**
 * ==========================================
 * 3️⃣ Eliminar proyecto 5S
 * DELETE /api/5s/proyectos/:id
 * (ON DELETE CASCADE limpia hijas)
 * ==========================================
 */
export const eliminarProyecto5S = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM proyectos_5s WHERE id = $1 RETURNING id;",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Proyecto 5S no encontrado" });
    }

    console.log("🗑️ Proyecto 5S eliminado:", id);
    res.json({ message: "Proyecto 5S eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando proyecto 5S:", error);
    res.status(500).json({ message: "Error al eliminar proyecto 5S" });
  }
};

/**
 * ==========================================
 * 4️⃣ Obtener un proyecto 5S por ID
 * GET /api/5s/proyectos/:id
 * ==========================================
 */
export const getProyecto5SById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.area,
        p.responsable,
        p.fecha_inicio,
        p.estado,
        p.avance,
        e.nombre AS empresa_nombre
      FROM proyectos_5s p
      LEFT JOIN empresas e ON e.id = p.empresa_id
      WHERE p.id = $1
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Proyecto 5S no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error obteniendo proyecto 5S por ID:", error);
    return res.status(500).json({ message: "Error al cargar proyecto 5S" });
  }
};
