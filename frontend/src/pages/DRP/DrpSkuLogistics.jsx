import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function DrpSkuLogistics() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorsList, setErrorsList] = useState([]);

  const handleUpload = async () => {
    if (!file) {
      setError("Debes seleccionar un archivo Excel");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setErrorsList([]);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/drp/sku-logistics/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessage(
        `Carga completada. Filas: ${res.data.total_rows} | Actualizados: ${res.data.updated} | Errores: ${res.data.errors}`
      );

      setErrorsList(res.data.error_details || []);
      setFile(null);

    } catch (err) {
      console.error("Error upload logística:", err);

      if (err.response) {
        setError(err.response.data?.message || "Error del servidor");
      } else {
        setError("No se pudo cargar el archivo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>DRP - Carga Logística de SKU</h2>

      <p style={{ marginBottom: 20 }}>
        Sube la plantilla oficial con parámetros logísticos de los SKU.
      </p>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

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
        {loading ? "Cargando..." : "Subir logística SKU"}
      </button>

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

      {errorsList.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>SKU rechazados</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>SKU</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {errorsList.map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 0" }}>{e.sku_code}</td>
                  <td style={{ padding: "6px 0" }}>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}