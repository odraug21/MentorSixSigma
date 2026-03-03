import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE } from "../config/env";
import { Link } from "react-router-dom";

export default function MTCPDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/mtcp/${companyId}/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (error) {
        console.error("Error cargando MTCP:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && token) fetchData();
  }, [companyId, token]);

  const handleGeneratePO = async () => {
    try {
      setGenerating(true);
      await axios.post(
        `${API_BASE}/api/mtcp/${companyId}/generate-purchase-orders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error generando PO:", error);
    } finally {
      setGenerating(false);
    }
  };

  const statusBadge = (status) => {
    if (status === "CRITICO")
      return "bg-red-600 text-white";
    if (status === "MEDIO")
      return "bg-yellow-500 text-black";
    return "bg-green-600 text-white";
  };

  const filteredData = useMemo(() => {
    if (!data?.top_criticos) return [];
    if (filter === "ALL") return data.top_criticos;
    return data.top_criticos.filter((i) => i.status === filter);
  }, [data, filter]);

  const coveragePromedio = useMemo(() => {
    if (!data?.top_criticos?.length) return 0;
    const total = data.top_criticos.reduce(
      (acc, item) => acc + Number(item.coverage_days),
      0
    );
    return (total / data.top_criticos.length).toFixed(1);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Cargando MTCP...
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">

        <h1 className="text-3xl font-bold text-red-400">
          🧠 MTCP – Control Inteligente de Inventario
        </h1>

        <div className="flex gap-4">

          <Link
            to="/kpi-mtcp"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            📊 Ver KPI MTCP
          </Link>

          <button
            onClick={() => setShowConfirm(true)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Generar Órdenes Automáticas
          </button>

        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

        <div className="bg-red-700 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-3xl font-bold">{summary.criticos}</h2>
          <p className="mt-2">Críticos</p>
        </div>

        <div className="bg-yellow-600 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-3xl font-bold">{summary.medios}</h2>
          <p className="mt-2">En Riesgo</p>
        </div>

        <div className="bg-green-600 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-3xl font-bold">{summary.ok}</h2>
          <p className="mt-2">OK</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-3xl font-bold">
            {summary.total_suggested_units}
          </h2>
          <p className="mt-2">Recomendación Compra</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-3xl font-bold">
            {coveragePromedio} días
          </h2>
          <p className="mt-2">Cobertura Promedio</p>
        </div>

      </div>

      {/* Filtro */}
      <div className="flex gap-4 mb-6">
        {["ALL", "CRITICO", "MEDIO", "OK"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${
              filter === f
                ? "bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">

        {filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            🎉 No hay productos críticos
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-gray-300">
                <th className="py-3">SKU / Producto</th>
                <th>Cobertura</th>
                <th>Sugerido</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="py-4">
                    <div className="font-semibold">
                      {item.sku_code}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {item.product_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Unidad: {item.unidad_base || "Un"}
                    </div>
                  </td>

                  <td>
                    {Number(item.coverage_days).toFixed(1)} días
                  </td>

                  <td>
                    {item.suggested_order_qty}{" "}
                    {item.unidad_base || "Un"}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Modal Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-2xl w-96 text-center">
            <h2 className="text-xl font-bold mb-4">
              Confirmar Generación
            </h2>
            <p className="mb-6 text-gray-300">
              Se generarán órdenes automáticas para los productos críticos.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={handleGeneratePO}
                disabled={generating}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                {generating ? "Generando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}