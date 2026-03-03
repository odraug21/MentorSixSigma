import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";

export default function DrpInventory() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleUpload = async () => {
    if (!file) {
      setError("Selecciona un archivo Excel");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${API_BASE}/api/drp/inventory/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        `Snapshot cargado correctamente. Registros insertados: ${res.data.inserted}`
      );
      setFile(null);

    } catch (err) {
      console.error(err);
      setError("Error cargando inventario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-emerald-400 mb-4">
        Upload Inventario (Snapshot ERP)
      </h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <div>
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
        >
          {loading ? "Subiendo..." : "Subir Inventario"}
        </button>
      </div>

      {message && (
        <p className="text-green-400 mt-4">{message}</p>
      )}

      {error && (
        <p className="text-red-400 mt-4">{error}</p>
      )}
    </div>
  );
}