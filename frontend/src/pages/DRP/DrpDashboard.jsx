// src/pages/DRP/DrpDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";

export default function DrpDashboard() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Ejecutar DRP y cargar plan
  const runDrp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/api/drp/run`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPlan(res.data.plan || []);
    } catch (err) {
      console.error("❌ Error ejecutando DRP:", err);
      alert("Error ejecutando DRP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Aprobar orden
  const aprobarOrden = async (row) => {
    try {
      await axios.post(
        `${API_BASE}/api/drp/approve`,
        {
          plan_date: row.plan_date,
          sku_code: row.sku_code,
          destination: row.destination,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Orden DRP aprobada");

      runDrp(); // refresca tabla

    } catch (err) {
      console.error("❌ Error aprobando orden:", err);
      alert("No se pudo aprobar la orden");
    }
  };

  useEffect(() => {
    runDrp();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">📊 Plan DRP generado</h1>

      {loading && (
        <p className="text-gray-400 mb-4">Ejecutando planificación...</p>
      )}

      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-2">Fecha llegada</th>
            <th className="p-2">SKU</th>
            <th className="p-2">Origen</th>
            <th className="p-2">Destino</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>

        <tbody>
          {plan.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-400">
                No hay sugerencias DRP para el período.
              </td>
            </tr>
          ) : (
            plan.map((row, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-2">
                  {new Date(row.d).toLocaleDateString()}
                </td>

                <td className="p-2">{row.sku_code}</td>

                <td className="p-2">{row.origin}</td>

                <td className="p-2">{row.destination}</td>

                <td className="p-2 font-bold text-cyan-400">
                  {Number(row.suggested_qty).toFixed(0)}
                </td>

                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      row.status === "APPROVED"
                        ? "bg-emerald-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="p-2">
                  {row.status === "SUGGESTED" ? (
                    <button
                      onClick={() => aprobarOrden(row)}
                      className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm"
                    >
                      Aprobar
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
