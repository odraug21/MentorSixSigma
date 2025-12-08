// backend/controllers/teepController.js
import pool from "../db.js";

/**
 * Calcula TEEP en porcentaje (0–100)
 * usando la misma lógica que el dashboard.
 */
function calcularTEEP({
  tiempo_calendario_min,
  tiempo_planificado_min,
  tiempo_operativo_min,
  produccion_teorica,
  produccion_real,
  unidades_buenas,
  unidades_totales,
}) {
  const cal = Number(tiempo_calendario_min) || 0;
  const plan = Number(tiempo_planificado_min) || 0;
  const op = Number(tiempo_operativo_min) || 0;
  const prodTeo = Number(produccion_teorica) || 0;
  const prodReal = Number(produccion_real) || 0;
  const ub = Number(unidades_buenas) || 0;
  const ut = Number(unidades_totales) || 0;

  if (!cal || !plan || !op || !prodTeo || !prodReal || !ub || !ut) return 0;

  const disponibilidad = op / plan;
  const rendimiento = prodReal / prodTeo;
  const calidad = ub / ut;
  const utilizacion = plan / cal;

  const teep = disponibilidad * rendimiento * calidad * utilizacion * 100;
  return Number(teep.toFixed(2));
}

/**
 * GET /api/teep
 * Lista todos los registros (más adelante se puede filtrar por empresa, fechas, etc.)
 */
export async function listarTeep(req, res) {
  try {
    // TODO: cuando tengas empresa_id en el token, filtrar por empresa_id
    const result = await pool.query(
      `SELECT 
         id,
         empresa_id,
         fecha,
         linea,
         turno,
         tiempo_calendario_min,
         tiempo_planificado_min,
         tiempo_operativo_min,
         produccion_teorica,
         produccion_real,
         unidades_buenas,
         unidades_totales,
         teep,
         created_at
       FROM public.teep_registros
       ORDER BY fecha DESC, id DESC`
    );

    return res.json({
      ok: true,
      registros: result.rows,
    });
  } catch (err) {
    console.error("❌ Error listando TEEP:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno listando registros TEEP",
    });
  }
}

/**
 * POST /api/teep
 * Crea un nuevo registro TEEP
 */
export async function crearTeep(req, res) {
  try {
    const {
      fecha,
      linea,
      turno,
      tiempo_calendario_min,
      tiempo_planificado_min,
      tiempo_operativo_min,
      produccion_teorica,
      produccion_real,
      unidades_buenas,
      unidades_totales,
    } = req.body;

    if (
      !fecha ||
      !linea ||
      !turno ||
      tiempo_calendario_min == null ||
      tiempo_planificado_min == null ||
      tiempo_operativo_min == null ||
      produccion_teorica == null ||
      produccion_real == null ||
      unidades_buenas == null ||
      unidades_totales == null
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios para crear TEEP",
      });
    }

    // TODO: cuando tengas empresa en el token, tomarla de ahí.
    // Por ahora dejo empresa_id = 1 para pruebas.
    const empresaId = 1;

    const teep = calcularTEEP({
      tiempo_calendario_min,
      tiempo_planificado_min,
      tiempo_operativo_min,
      produccion_teorica,
      produccion_real,
      unidades_buenas,
      unidades_totales,
    });

    const insertQuery = `
      INSERT INTO public.teep_registros (
        empresa_id,
        fecha,
        linea,
        turno,
        tiempo_calendario_min,
        tiempo_planificado_min,
        tiempo_operativo_min,
        produccion_teorica,
        produccion_real,
        unidades_buenas,
        unidades_totales,
        teep
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12
      )
      RETURNING *
    `;

    const values = [
      empresaId,
      fecha,
      linea,
      turno,
      Number(tiempo_calendario_min),
      Number(tiempo_planificado_min),
      Number(tiempo_operativo_min),
      Number(produccion_teorica),
      Number(produccion_real),
      Number(unidades_buenas),
      Number(unidades_totales),
      teep,
    ];

    const result = await pool.query(insertQuery, values);

    return res.status(201).json({
      ok: true,
      registro: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creando TEEP:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno creando registro TEEP",
    });
  }
}

/**
 * DELETE /api/teep/:id
 */
export async function eliminarTeep(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM public.teep_registros WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: "Registro TEEP no encontrado",
      });
    }

    return res.json({
      ok: true,
      message: "Registro TEEP eliminado correctamente",
    });
  } catch (err) {
    console.error("❌ Error eliminando TEEP:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno eliminando registro TEEP",
    });
  }
}
