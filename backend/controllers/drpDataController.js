import pool from "../db.js";
import XLSX from "xlsx";

/* ======================================================
   UPLOAD HISTÓRICO DE VENTAS DESDE EXCEL
====================================================== */

export const uploadVentasHist = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;

    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Archivo requerido" });
    }

    /* Leer Excel */
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!data.length) {
      return res.status(400).json({ ok: false, message: "Archivo vacío" });
    }

const client = await pool.connect();
await client.query("BEGIN");

/* 1. Registrar upload */
const uploadResult = await client.query(`
  INSERT INTO drp_file_uploads
    (empresa_id, file_type, upload_type, original_name, status, uploaded_by)
  VALUES ($1,'ventas','HISTORICO',$2,'UPLOADED',$3)
  RETURNING upload_id
`, [empresaId, req.file.originalname, req.user?.id]);

const uploadId = uploadResult.rows[0].upload_id;


/* 2. Guardar en staging con upload_id */
for (let i = 0; i < data.length; i++) {
  const row = data[i];

  await client.query(
    `
    INSERT INTO drp_data_staging (
      empresa_id,
      tipo_data,
      raw_json,
      status,
      upload_id
    )
    VALUES ($1,'ventas',$2,'PENDING',$3)
    `,
    [empresaId, row, uploadId]
  );
}

    await client.query("COMMIT");
    client.release();

    res.json({
      ok: true,
      upload_id: uploadId,
      rows_loaded: data.length,
      message: "Ventas cargadas en staging"
    });

  } catch (error) {
    console.error("❌ Error upload ventas:", error);
    res.status(500).json({ ok: false, message: "Error cargando ventas" });
  }
};

/* ======================================================
   VALIDAR HISTÓRICO DE VENTAS
====================================================== */

export const validateVentasHist = async (req, res) => {
  const client = await pool.connect();

  try {
    const empresaId = req.user?.empresa_id;

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      SELECT id, parsed_data
      FROM drp_data_staging
      WHERE empresa_id = $1
      AND tipo_data = 'ventas'
      AND validation_status = 'PENDING'
      `,
      [empresaId]
    );

    for (const row of rows) {
      const data = row.parsed_data;

      let status = "OK";
      let message = null;

      /* Validar fecha */
      if (!data.fecha || isNaN(Date.parse(data.fecha))) {
        status = "ERROR";
        message = "Fecha inválida";
      }

      /* Validar qty */
      if (!data.qty || Number(data.qty) <= 0) {
        status = "ERROR";
        message = "Cantidad inválida";
      }

      /* Validar SKU */
      if (status === "OK") {
        const skuCheck = await client.query(
          `SELECT sku_id FROM sku WHERE sku_code = $1 LIMIT 1`,
          [data.sku_code]
        );

        if (skuCheck.rows.length === 0) {
          status = "ERROR";
          message = "SKU no existe";
        }
      }

      /* Validar Location */
      if (status === "OK" && data.location_code) {
        const locCheck = await client.query(
          `SELECT location_id FROM location WHERE location_code = $1 LIMIT 1`,
          [data.location_code]
        );

        if (locCheck.rows.length === 0) {
          status = "ERROR";
          message = "Location no existe";
        }
      }

      await client.query(
        `
        UPDATE drp_data_staging
        SET validation_status = $1,
            validation_message = $2
        WHERE id = $3
        `,
        [status, message, row.id]
      );
    }

    await client.query("COMMIT");

    res.json({
      ok: true,
      message: "Validación completada"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error validando ventas:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   VALIDAR POR UPLOAD
====================================================== */
export const validateVentasByUpload = async (req, res) => {
  const client = await pool.connect();

  try {
    const { upload_id } = req.params;
    const empresaId = req.user?.empresa_id;

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      SELECT id, raw_json
      FROM drp_data_staging
      WHERE empresa_id = $1
      AND upload_id = $2
      AND status = 'PENDING'
      `,
      [empresaId, upload_id]
    );

    let errorCount = 0;

    for (const row of rows) {
      const data = row.raw_json;

      let status = "OK";

      // validar fecha
      if (!data.fecha || isNaN(Date.parse(data.fecha))) {
        status = "ERROR";
      }

      // validar qty
      if (!data.qty || Number(data.qty) <= 0) {
        status = "ERROR";
      }

      // validar SKU
      if (status === "OK") {
        const skuCheck = await client.query(
          `SELECT sku_id FROM sku WHERE sku_code = $1 LIMIT 1`,
          [data.sku_code]
        );

        if (skuCheck.rows.length === 0) status = "ERROR";
      }

      // validar location
      if (status === "OK") {
        const locCheck = await client.query(
          `SELECT location_id FROM location WHERE location_code = $1 LIMIT 1`,
          [data.location_code]
        );

        if (locCheck.rows.length === 0) status = "ERROR";
      }

      if (status === "ERROR") errorCount++;

      await client.query(
        `
        UPDATE drp_data_staging
        SET status = $1
        WHERE id = $2
        `,
        [status, row.id]
      );
    }

    // actualizar resumen en upload
    await client.query(
      `
      UPDATE drp_file_uploads
      SET validation_errors = $1,
          status = 'VALIDATED'
      WHERE upload_id = $2
      `,
      [errorCount, upload_id]
    );

    await client.query("COMMIT");

    res.json({
      ok: true,
      total_rows: rows.length,
      errors: errorCount
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error validando upload:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   UPLOAD DATOS LOGISTICOS
====================================================== */

export const uploadSkuLogistics = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Archivo requerido" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

    await client.query("BEGIN");

    let updated = 0;
    let errors = [];
    const empresaId = req.user?.empresa_id;

    for (const row of data) {
      const skuCode = String(row.sku_code).trim().toUpperCase();

      if (!skuCode) {
        errors.push({ sku_code: null, message: "sku_code vacío" });
        continue;
      }

     const skuCheck = await client.query(
         `
        SELECT sku_id 
        FROM sku 
        WHERE UPPER(TRIM(sku_code)) = $1
        LIMIT 1
        `,
        [skuCode]
);

      if (skuCheck.rows.length === 0) {
        errors.push({ sku_code: skuCode, message: "SKU no existe" });
        continue;
      }

      const skuId = skuCheck.rows[0].sku_id;

      await client.query(
        `
        INSERT INTO sku_logistics_profile (
          sku_id,
          unidad_base,
          unidades_por_caja,
          cajas_por_pallet,
          unidades_por_pallet,
          peso_unitario,
          volumen_unitario,
          vida_util_dias,
          categoria,
          segmento_abc,
          lead_time_dias,
          lote_minimo,
          lote_economico,
          stock_seguridad,
          control_lote,
          fefo
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        ON CONFLICT (sku_id) DO UPDATE SET
          unidad_base = EXCLUDED.unidad_base,
          unidades_por_caja = EXCLUDED.unidades_por_caja,
          cajas_por_pallet = EXCLUDED.cajas_por_pallet,
          unidades_por_pallet = EXCLUDED.unidades_por_pallet,
          peso_unitario = EXCLUDED.peso_unitario,
          volumen_unitario = EXCLUDED.volumen_unitario,
          vida_util_dias = EXCLUDED.vida_util_dias,
          categoria = EXCLUDED.categoria,
          segmento_abc = EXCLUDED.segmento_abc,
          lead_time_dias = EXCLUDED.lead_time_dias,
          lote_minimo = EXCLUDED.lote_minimo,
          lote_economico = EXCLUDED.lote_economico,
          stock_seguridad = EXCLUDED.stock_seguridad,
          control_lote = EXCLUDED.control_lote,
          fefo = EXCLUDED.fefo
        `,
        [
          skuId,
          row.unidad_base,
          row.unidades_por_caja,
          row.cajas_por_pallet,
          row.unidades_por_pallet,
          row.peso_unitario,
          row.volumen_unitario,
          row.vida_util_dias,
          row.categoria,
          row.segmento_abc,
          row.lead_time_dias,
          row.lote_minimo,
          row.lote_economico,
          row.stock_seguridad,
          row.control_lote === true,
          row.fefo === true
        ]
      );

      updated++;
    }

    await client.query("COMMIT");

    res.json({
      ok: true,
      total_rows: data.length,
      updated,
      errors: errors.length,
      error_details: errors
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error cargando logística SKU:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   UPLOAD INVENTARIO SNAPSHOT ERP
====================================================== */

export const uploadInventorySnapshot = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Archivo requerido" });
    }

    const empresaId = req.user?.empresa_id;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!data.length) {
      return res.status(400).json({ ok: false, message: "Archivo vacío" });
    }

    await client.query("BEGIN");

    let inserted = 0;
    let errors = [];

    for (const row of data) {
      const skuCode = String(row.sku_code || "").trim().toUpperCase();
      const locationCode = String(row.location_code || "").trim().toUpperCase();

      if (!skuCode || !locationCode) {
        errors.push({ row, message: "sku_code o location_code vacío" });
        continue;
      }

      /* =============================
         VALIDAR SKU
      ============================== */
      const skuCheck = await client.query(
        `SELECT sku_id FROM sku WHERE UPPER(TRIM(sku_code)) = $1 LIMIT 1`,
        [skuCode]
      );

      if (skuCheck.rows.length === 0) {
        errors.push({ sku_code: skuCode, message: "SKU no existe" });
        continue;
      }

      /* =============================
         VALIDAR LOCATION
      ============================== */
      const locationCheck = await client.query(
        `SELECT location_id FROM location WHERE UPPER(TRIM(location_code)) = $1 LIMIT 1`,
        [locationCode]
      );

      if (locationCheck.rows.length === 0) {
        errors.push({ location_code: locationCode, message: "Location no existe" });
        continue;
      }

      /* =============================
         CONVERTIR FECHA EXCEL
      ============================== */
      const excelDate = row.snapshot_datetime;

      let snapshotDatetime;

      if (typeof excelDate === "number") {
        // Excel serial → JS Date
        snapshotDatetime = new Date((excelDate - 25569) * 86400 * 1000);
      } else {
        snapshotDatetime = new Date(excelDate);
      }

      if (!snapshotDatetime || isNaN(snapshotDatetime)) {
        errors.push({ row, message: "snapshot_datetime inválido" });
        continue;
      }

      /* =============================
         STOCKS
      ============================== */
      const stockOnHand = Number(row.stock_on_hand || 0);
      const stockCommitted = Number(row.stock_committed || 0);
      const stockAvailable = stockOnHand - stockCommitted;

      /* =============================
         INSERT SNAPSHOT
      ============================== */
      await client.query(
        `
        INSERT INTO drp_inventory_snapshots (
          empresa_id,
          snapshot_datetime,
          sku_id,
          location_id,
          stock_on_hand,
          stock_committed,
          stock_available
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          empresaId,
          snapshotDatetime,
          skuCheck.rows[0].sku_id,
          locationCheck.rows[0].location_id,
          stockOnHand,
          stockCommitted,
          stockAvailable
        ]
      );

      inserted++;
    }

    await client.query("COMMIT");

    res.json({
      ok: true,
      inserted,
      errors: errors.length,
      error_detail: errors
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error upload inventario:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};