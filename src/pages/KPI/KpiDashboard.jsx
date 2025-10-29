// src/pages/KPI/KpiDashboard.jsx
import React, { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import KpiCharts from "./KpiCharts";
import { useNavigate } from "react-router-dom";

export default function KpiDashboard() {
  const navigate = useNavigate();
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [data, setData] = useState({ oee: [], ooe: [], teep: [] });

  // 🔹 Cargar datos de LocalStorage
  useEffect(() => {
    const oee = JSON.parse(localStorage.getItem("oee-data") || "[]");
    const ooe = JSON.parse(localStorage.getItem("ooe-data") || "[]");
    const teep = JSON.parse(localStorage.getItem("teep-data") || "[]");
    setData({ oee, ooe, teep });
  }, []);

  // 🔹 Filtro por mes / año
  const filtrarDatos = (arr) => {
    return arr.filter((r) => {
      const fecha = new Date(r.fecha);
      const coincideAnio = filtroAnio ? fecha.getFullYear() === Number(filtroAnio) : true;
      const coincideMes = filtroMes ? fecha.getMonth() + 1 === Number(filtroMes) : true;
      return coincideAnio && coincideMes;
    });
  };

  const calcPromedio = (arr, key) => {
    if (!arr.length) return 0;
    const total = arr.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0);
    return total / arr.length;
  };

  const oee = calcPromedio(filtrarDatos(data.oee), "oee");
  const ooe = calcPromedio(filtrarDatos(data.ooe), "ooe");
  const teep = calcPromedio(filtrarDatos(data.teep), "teep");

  // 🔹 Datos para gráfico (comparativo mes a mes)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthName = new Date(2025, i).toLocaleString("es-CL", { month: "short" });

    const oeeM = calcPromedio(
      data.oee.filter((r) => new Date(r.fecha).getMonth() + 1 === month),
      "oee"
    );
    const ooeM = calcPromedio(
      data.ooe.filter((r) => new Date(r.fecha).getMonth() + 1 === month),
      "ooe"
    );
    const teepM = calcPromedio(
      data.teep.filter((r) => new Date(r.fecha).getMonth() + 1 === month),
      "teep"
    );

    return { mes: monthName, OEE: oeeM, OOE: ooeM, TEEP: teepM };
  });

  const aniosDisponibles = Array.from(
    new Set([
      ...data.oee.map((r) => new Date(r.fecha).getFullYear()),
      ...data.ooe.map((r) => new Date(r.fecha).getFullYear()),
      ...data.teep.map((r) => new Date(r.fecha).getFullYear()),
    ])
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6">
        📈 Dashboard Gerencial de KPIs
      </h1>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <select
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded"
        >
          <option value="">Todos los años</option>
          {aniosDisponibles.map((a, i) => (
            <option key={i} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded"
        >
          <option value="">Todos los meses</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(2025, i).toLocaleString("es-CL", { month: "long" })}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFiltroAnio("");
            setFiltroMes("");
          }}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Limpiar filtros
        </button>
                  <button
           onClick={() => navigate("/inicio")}
           className="bg-gray-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
          >
          Volver al menú principal
          </button>
      </div>

      {/* KPIs resumidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        <KpiCard titulo="OEE" valor={oee} meta={85} />
        <KpiCard titulo="OOE" valor={ooe} meta={80} />
        <KpiCard titulo="TEEP" valor={teep} meta={75} />
      </div>

      {/* Gráfico comparativo */}
      <KpiCharts data={monthlyData} />
    </div>
  );
}
