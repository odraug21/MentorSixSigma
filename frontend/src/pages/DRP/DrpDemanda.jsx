import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function DrpDemanda() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadId, setUploadId] = useState(null);

  /* =========================
     UPLOAD EXCEL
  ========================= */

  const handleUpload = async () => {
    if (!file) {
      setError("Debes seleccionar un archivo Excel");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/drp/ventas/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setUploadId(res.data.upload_id);
      setMessage(`Archivo cargado correctamente. Filas: ${res.data.rows_loaded}`);
      setFile(null);

    } catch (err) {
      console.error("Error upload:", err);

      if (err.response) {
        setError(err.response.data?.message || "Error del servidor");
      } else if (err.request) {
        setError("No se pudo conectar con el backend");
      } else {
        setError("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VALIDAR DATASET
  ========================= */

  const handleValidate = async () => {
    if (!uploadId) {
      setError("No hay archivo para validar");
      return;
    }

    try {
      setValidating(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/drp/ventas/validate/${uploadId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        `Validación completada. Registros: ${res.data.total_rows} | Errores: ${res.data.errors}`
      );

    } catch (err) {
      console.error("Error validando:", err);
      setError("Error validando archivo");
    } finally {
      setValidating(false);
    }
  };

  /* =========================
     CONFIRMAR DATASET (COMMIT)
  ========================= */

  const handleCommit = async () => {
    if (!uploadId) {
      setError("No hay dataset para confirmar");
      return;
    }

    try {
      setCommitting(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/drp/ventas/commit/${uploadId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        `Dataset confirmado. Versión: ${res.data.version_number} | Registros: ${res.data.records_committed}`
      );

    } catch (err) {
      console.error("Error commit:", err);
      setError("Error confirmando dataset");
    } finally {
      setCommitting(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ padding: 30 }}>
      <h2>DRP - Carga Histórica de Ventas</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginTop: 15 }}>
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            backgroundColor: "#1976d2",
            color: "white",
            padding: "10px 18px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          {loading ? "Subiendo archivo..." : "Subir archivo"}
        </button>

        {uploadId && (
          <button
            onClick={handleValidate}
            disabled={validating}
            style={{
              marginLeft: 12,
              backgroundColor: "#00c853",
              color: "white",
              padding: "10px 18px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            {validating ? "Validando..." : "Validar archivo"}
          </button>
        )}

        {uploadId && (
          <button
            onClick={handleCommit}
            disabled={committing}
            style={{
              marginLeft: 12,
              backgroundColor: "#ff9800",
              color: "white",
              padding: "10px 18px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            {committing ? "Confirmando..." : "Confirmar dataset"}
          </button>
        )}
      </div>

      {message && (
        <p style={{ color: "#00e676", marginTop: 15 }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "#ff5252", marginTop: 15 }}>
          {error}
        </p>
      )}
    </div>
  );
}