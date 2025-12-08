import pool from "../db.js";

export const crearParada = async (req, res) => {
  try {
    const { registro_id, hora, causa, minutos, tipo_falla, comentario } = req.body;

    const q = `
      INSERT INTO oee_paradas (registro_id, hora, causa, minutos, tipo_falla, comentario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await pool.query(q, [
      registro_id,
      hora,
      causa,
      minutos,
      tipo_falla,
      comentario
    ]);

    res.json({ ok: true, parada: result.rows[0] });
  } catch (err) {
    console.error("❌ Error creando parada:", err);
    res.status(500).json({ ok: false });
  }
};

export const obtenerParadas = async (req, res) => {
  try {
    const { registro_id } = req.params;

    const q = `
      SELECT * FROM oee_paradas
      WHERE registro_id = $1
      ORDER BY hora ASC;
    `;

    const result = await pool.query(q, [registro_id]);

    res.json({ ok: true, paradas: result.rows });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ ok: false });
  }
};

export const eliminarParada = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM oee_paradas WHERE id = $1", [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ ok: false });
  }
};
