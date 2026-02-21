import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/env";
import { useNavigate } from "react-router-dom";

export default function DrpPlan() {
  const [plan, setPlan] = useState([]);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ======================================================
     EJECUTAR DRP (GENERA NUEVO RUN)
  ====================================================== */
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
      setRunId(res.data.run_id);

    } catch (err) {
      console.error("❌ Error ejecutando DRP:", err);

      if (err?.response?.status === 401) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      alert("Error ejecutando DRP");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     REFRESCAR RUN ACTUAL (NO recalcula motor)
  ====================================================== */
  const refreshPlan = async () => {
    if (!runId) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/drp/plan/${runId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPlan(res.data.plan || []);
    } catch (err) {
      console.error("❌ Error refrescando plan:", err);
    }
  };

  /* ======================================================
     APROBAR UNA ORDEN 🔥 FIX REAL
  ====================================================== */
  const aprobarOrden = async (row) => {
    try {
      await axios.post(
        `${API_BASE}/api/drp/approve`,
        {
          run_id: runId,
          sku_code: row.sku_code,
          destination: row.destination,
          d: row.d, // 🔥 CLAVE para identificar línea única
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await refreshPlan();

    } catch (err) {
      console.error("❌ Error aprobando orden:", err);

      if (err?.response?.status === 401) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      alert("No se pudo aprobar la orden");
    }
  };

  /* ======================================================
     APROBAR TODO EL RUN
  ====================================================== */
  const aprobarTodo = async () => {
    if (!runId) return;

    try {
      setApprovingAll(true);

      await axios.post(
        `${API_BASE}/api/drp/approve-all`,
        { run_id: runId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await refreshPlan();

    } catch (err) {
      console.error("❌ Error aprobando todo:", err);

      if (err?.response?.status === 401) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      alert("No se pudo aprobar todo el plan");
    } finally {
      setApprovingAll(false);
    }
  };

  useEffect(() => {
    runDrp();
  }, []);

  const haySugerencias = plan.some((p) => p.status === "SUGGESTED");

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Plan DRP</h1>

        <div className="flex gap-3">
          <button
            onClick={runDrp}
            className="bg-cyan-700 hover:bg-cyan-800 px-4 py-2 rounded"
          >
            Recalcular
          </button>

          <button
            onClick={aprobarTodo}
            disabled={!haySugerencias || approvingAll}
            className={`px-4 py-2 rounded ${
              haySugerencias
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {approvingAll ? "Aprobando..." : "Aprobar todo"}
          </button>

          <button
            onClick={() => navigate("/drp/intro")}
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
          >
            Menú DRP
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-400 mb-4">Ejecutando planificación...</p>
      )}

      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700 text-center">
          <tr>
            <th className="p-3">Fecha llegada</th>
            <th className="p-3">SKU</th>
            <th className="p-3">Origen</th>
            <th className="p-3">Destino</th>
            <th className="p-3">Cantidad</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {plan.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-gray-400">
                No hay sugerencias DRP.
              </td>
            </tr>
          ) : (
            plan.map((row, i) => (
              <tr key={`${row.sku_code}-${row.destination}-${row.d}-${i}`} className="border-t border-gray-700">
                <td className="p-3">
                  {new Date(row.d).toLocaleDateString()}
                </td>

                <td className="p-3">{row.sku_code}</td>
                <td className="p-3">{row.origin}</td>
                <td className="p-3">{row.destination}</td>

                <td className="p-3 font-bold text-cyan-400">
                  {Number(row.suggested_qty).toFixed(0)}
                </td>

                <td className="p-3">
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

                <td className="p-3">
                  {row.status === "SUGGESTED" ? (
                    <button
                      onClick={() => aprobarOrden(row)}
                      className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm"
                    >
                      Aprobar
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
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