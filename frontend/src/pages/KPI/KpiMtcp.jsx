import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { API_BASE } from "../../config/env";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

export default function KpiMtcp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/mtcp/${companyId}/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error("Error KPI MTCP:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && token) fetchData();
  }, [companyId, token]);

  const coverageTrend = useMemo(() => {
    if (!data?.top_criticos) return [];
    return data.top_criticos.slice(0, 6).map((item, index) => ({
      mes: `SKU ${index + 1}`,
      cobertura: Number(item.coverage_days),
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.summary) return [];
    return [
      { name: "Críticos", value: data.summary.criticos },
      { name: "En Riesgo", value: data.summary.medios },
      { name: "OK", value: data.summary.ok },
    ];
  }, [data]);

  const coveragePromedio = useMemo(() => {
    if (!data?.top_criticos?.length) return 0;
    const total = data.top_criticos.reduce(
      (acc, item) => acc + Number(item.coverage_days),
      0
    );
    return (total / data.top_criticos.length).toFixed(1);
  }, [data]);

  /* ======================================================
     SEMÁFORO DINÁMICO
  ====================================================== */
  const semaforo = useMemo(() => {
    const value = Number(coveragePromedio);

    if (value < 7)
      return { label: "CRÍTICO", color: "bg-red-600" };

    if (value < 14)
      return { label: "RIESGO", color: "bg-yellow-500 text-black" };

    return { label: "SALUDABLE", color: "bg-green-600" };
  }, [coveragePromedio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Cargando KPI MTCP...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      <h1 className="text-3xl font-bold text-indigo-400 mb-10">
        📊 KPI MTCP – Dashboard Ejecutivo
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">

        {/* NUEVA CARD SEMÁFORO */}
        <div className={`${semaforo.color} p-6 rounded-2xl shadow-lg text-center`}>
          <h2 className="text-2xl font-bold">
            {semaforo.label}
          </h2>
          <p className="mt-2">Estado Inventario</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-indigo-400">
            {coveragePromedio} días
          </h2>
          <p className="text-gray-400 mt-2">Cobertura Promedio</p>
        </div>

        <div className="bg-red-700 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold">
            {data.summary.criticos}
          </h2>
          <p className="mt-2">Productos Críticos</p>
        </div>

        <div className="bg-yellow-600 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold">
            {data.summary.medios}
          </h2>
          <p className="mt-2">En Riesgo</p>
        </div>

        <div className="bg-green-600 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold">
            {data.summary.ok}
          </h2>
          <p className="mt-2">OK</p>
        </div>

      </div>

      {/* GRAFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Line Chart */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="mb-6 font-semibold text-lg">
            📈 Tendencia Cobertura
          </h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={coverageTrend}>
                <CartesianGrid stroke="#374151" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cobertura"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="mb-6 font-semibold text-lg">
            🧩 Distribución de Riesgo
          </h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}