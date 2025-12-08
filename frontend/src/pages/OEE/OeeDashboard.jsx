// src/pages/OEE/OeeDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function OeeDashboard() {
  const [historial, setHistorial] = useState([]);
  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    linea: "",
    turno: "",
  });
  const [modoVista, setModoVista] = useState("filtrado");
  const [modoComparativo, setModoComparativo] = useState("linea");
  const [modoTiempo, setModoTiempo] = useState("fecha"); // "fecha" | "hora"

  const navigate = useNavigate();

  // ================== CARGA DE DATOS ==================
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/oee/registros");
        if (resp.ok && Array.isArray(resp.registros)) {
          setHistorial(resp.registros);
          localStorage.setItem("oee-historial", JSON.stringify(resp.registros));
          return;
        }
      } catch (err) {
        console.error("❌ Error cargando OEE Dashboard desde API:", err);
      }

      const data = localStorage.getItem("oee-historial");
      if (data) setHistorial(JSON.parse(data));
    })();
  }, []);

  const lineasUnicas = useMemo(
    () => [...new Set(historial.map((h) => h.linea).filter(Boolean))],
    [historial]
  );

  // ================== FILTROS ==================
  const filtrado = useMemo(() => {
    return historial.filter((h) => {
      const fechaBase = h.fecha || h.created_at;
      const fechaStr = typeof fechaBase === "string" ? fechaBase : "";
      const fechaOk =
        (!filtros.desde || fechaStr >= filtros.desde) &&
        (!filtros.hasta || fechaStr <= filtros.hasta);
      const lineaOk = !filtros.linea || h.linea === filtros.linea;
      const turnoOk = !filtros.turno || h.turno === filtros.turno;
      return fechaOk && lineaOk && turnoOk;
    });
  }, [historial, filtros]);

  const promedio = (data, campo) =>
    (
      data.reduce((acc, r) => acc + parseFloat(r[campo] || 0), 0) /
      (data.length || 1)
    ).toFixed(2);

  const avgDisp = promedio(filtrado, "disponibilidad");
  const avgRend = promedio(filtrado, "rendimiento");
  const avgCal = promedio(filtrado, "calidad");
  const avgOee = promedio(filtrado, "oee");
  const overallOee = Number(avgOee) || 0;

  // ================== RESUMEN POR LÍNEA ==================
  const resumenPorLinea = useMemo(() => {
    const mapa = {};
    filtrado.forEach((r) => {
      const key = r.linea || "Sin línea";
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(r);
    });

    return Object.entries(mapa).map(([nombre, registros]) => ({
      nombre,
      oee: Number(promedio(registros, "oee")),
      disp: Number(promedio(registros, "disponibilidad")),
      rend: Number(promedio(registros, "rendimiento")),
      cal: Number(promedio(registros, "calidad")),
    }));
  }, [filtrado]);

  const resumenOrdenado = [...resumenPorLinea].sort((a, b) => a.oee - b.oee);

  // ================== LABELS FECHA / HORA ==================
  const labelsFiltrado = useMemo(() => {
    return filtrado.map((h) => {
      const base =
        modoTiempo === "hora" ? h.created_at || h.fecha : h.fecha || h.created_at;

      if (!base) return "";

      const d = new Date(base);

      if (modoTiempo === "hora") {
        return d.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
      });
    });
  }, [filtrado, modoTiempo]);

  // ================== DATA GRÁFICOS ==================
  const dataBar = {
    labels: labelsFiltrado,
    datasets: [
      {
        label: "Disponibilidad (%)",
        data: filtrado.map((h) => h.disponibilidad),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Rendimiento (%)",
        data: filtrado.map((h) => h.rendimiento),
        backgroundColor: "#22c55e",
      },
      {
        label: "Calidad (%)",
        data: filtrado.map((h) => h.calidad),
        backgroundColor: "#eab308",
      },
    ],
  };

  const dataLine = {
    labels: labelsFiltrado,
    datasets: [
      {
        label: "OEE (%)",
        data: filtrado.map((h) => h.oee),
        borderColor: "#facc15",
        backgroundColor: "rgba(250,204,21,0.3)",
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#374151" },
      },
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#374151" },
      },
    },
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: "70%",
  };

  const dataOeeGauge = {
    labels: ["OEE", "Libre"],
    datasets: [
      {
        data: [overallOee, Math.max(0, 100 - overallOee)],
        backgroundColor: ["#22c55e", "#1f2937"],
        borderWidth: 0,
      },
    ],
  };

  const dataParetoLineas = {
    labels: resumenOrdenado.map((r) => r.nombre),
    datasets: [
      {
        label: "OEE promedio (%)",
        data: resumenOrdenado.map((r) => r.oee),
        backgroundColor: "#facc15",
      },
    ],
  };

  // ================== VISTA COMPARATIVA ==================
  const agrupados = useMemo(() => {
    const grupos = {};
    historial.forEach((h) => {
      const key =
        modoComparativo === "turno"
          ? h.turno || "Sin Turno"
          : h.linea || "Sin Línea";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(h);
    });
    return grupos;
  }, [historial, modoComparativo]);

  const promediosComparativos = Object.entries(agrupados).map(
    ([nombre, registros]) => ({
      nombre,
      disponibilidad: promedio(registros, "disponibilidad"),
      rendimiento: promedio(registros, "rendimiento"),
      calidad: promedio(registros, "calidad"),
      oee: promedio(registros, "oee"),
    })
  );

  const dataComparativo = {
    labels: promediosComparativos.map((p) => p.nombre),
    datasets: [
      {
        label: "Disponibilidad",
        data: promediosComparativos.map((p) => p.disponibilidad),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Rendimiento",
        data: promediosComparativos.map((p) => p.rendimiento),
        backgroundColor: "#22c55e",
      },
      {
        label: "Calidad",
        data: promediosComparativos.map((p) => p.calidad),
        backgroundColor: "#eab308",
      },
      {
        label: "OEE Total",
        data: promediosComparativos.map((p) => p.oee),
        backgroundColor: "#facc15",
      },
    ],
  };

  // ================== SIN DATOS ==================
  if (historial.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="text-gray-400 mb-4">Aún no hay registros de OEE guardados.</p>
        <p className="text-indigo-400">
          Por favor ingresa datos desde el módulo OEE Builder.
        </p>
      </div>
    );
  }

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">📊 Dashboard OEE</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs vista */}
          <div className="flex bg-gray-800 rounded overflow-hidden border border-gray-700">
            <button
              onClick={() => setModoVista("filtrado")}
              className={`px-4 py-2 text-sm md:text-base ${
                modoVista === "filtrado" ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              Vista OEE
            </button>
            <button
              onClick={() => setModoVista("comparativo")}
              className={`px-4 py-2 text-sm md:text-base ${
                modoVista === "comparativo" ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              Comparativo
            </button>
          </div>

          {/* Botón acción */}
          <button
            onClick={() => navigate("/oee/builder")}
            className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base"
          >
            Ir al Registro OEE
          </button>
        </div>
      </div>

      {/* ================== VISTA POWERBI ================== */}
      {modoVista === "filtrado" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar filtros */}
          <aside className="col-span-12 md:col-span-2 bg-gray-900/80 border border-gray-800 rounded-xl p-3 space-y-4">
            {/* Turno */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Turno
              </h3>
              <div className="flex flex-col gap-2">
                {["", "Mañana", "Tarde", "Noche"].map((t) => (
                  <button
                    key={t || "todos"}
                    onClick={() =>
                      setFiltros((prev) => ({ ...prev, turno: t || "" }))
                    }
                    className={`w-full py-2 px-2 text-sm rounded border ${
                      filtros.turno === t || (!t && !filtros.turno)
                        ? "bg-indigo-600 border-indigo-400 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {t || "Todos"}
                  </button>
                ))}
              </div>
            </div>

            {/* Línea / estación */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Línea / Equipo
              </h3>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                <button
                  onClick={() =>
                    setFiltros((prev) => ({ ...prev, linea: "" }))
                  }
                  className={`w-full py-2 px-2 text-sm rounded border ${
                    !filtros.linea
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Todas
                </button>
                {lineasUnicas.map((l) => (
                  <button
                    key={l}
                    onClick={() =>
                      setFiltros((prev) => ({ ...prev, linea: l }))
                    }
                    className={`w-full py-2 px-2 text-sm rounded border ${
                      filtros.linea === l
                        ? "bg-indigo-600 border-indigo-400 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Rango fecha */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Rango de Fecha
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="block text-gray-400 mb-1">Desde</span>
                  <input
                    type="date"
                    value={filtros.desde}
                    onChange={(e) =>
                      setFiltros((prev) => ({ ...prev, desde: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <span className="block text-gray-400 mb-1">Hasta</span>
                  <input
                    type="date"
                    value={filtros.hasta}
                    onChange={(e) =>
                      setFiltros((prev) => ({ ...prev, hasta: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  />
                </div>
                <button
                  onClick={() =>
                    setFiltros({ desde: "", hasta: "", linea: "", turno: "" })
                  }
                  className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-xs py-1 rounded"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Selector de eje X fecha/hora */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Eje X (gráficos)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setModoTiempo("fecha")}
                  className={`flex-1 py-1 text-xs rounded border ${
                    modoTiempo === "fecha"
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Fecha
                </button>
                <button
                  onClick={() => setModoTiempo("hora")}
                  className={`flex-1 py-1 text-xs rounded border ${
                    modoTiempo === "hora"
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Hora
                </button>
              </div>
            </div>
          </aside>

          {/* Área principal */}
          <main className="col-span-12 md:col-span-10 space-y-4">
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400">Disponibilidad</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {avgDisp}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400">Rendimiento</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {avgRend}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400">Calidad</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {avgCal}%
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 border border-yellow-500">
                <p className="text-xs text-gray-300 font-semibold">
                  OEE Promedio
                </p>
                <p className="text-2xl font-bold text-yellow-300 mt-1">
                  {avgOee}%
                </p>
              </div>
            </div>

            {/* Fila: OEE gauge + Tendencia OEE (más compactos) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* OEE gauge */}
              <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center h-52">
                <h2 className="text-sm font-semibold mb-2">OEE</h2>
                <div className="w-28 h-28 relative">
                  <Doughnut data={dataOeeGauge} options={gaugeOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-yellow-300">
                      {overallOee.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Tendencia OEE */}
              <div className="bg-gray-800 rounded-xl p-4 lg:col-span-2 h-52">
                <h2 className="text-sm font-semibold mb-2">Tendencia OEE</h2>
                <div className="h-40">
                  <Line data={dataLine} options={lineOptions} />
                </div>
              </div>
            </div>

            {/* Fila: Pareto + D/R/C */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pareto por línea */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h2 className="text-sm font-semibold mb-2">
                  Pareto por Línea (OEE promedio)
                </h2>
                <Bar data={dataParetoLineas} />
              </div>

              {/* Factores D/R/C por registro */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h2 className="text-sm font-semibold mb-2">
                  Factores D/R/C por registro
                </h2>
                <Bar data={dataBar} />
              </div>
            </div>

            {/* Grid mini-gauges por línea */}
            {resumenOrdenado.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h2 className="text-sm font-semibold mb-3">
                  OEE por Línea / Equipo
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {resumenOrdenado.map((linea) => (
                    <div
                      key={linea.nombre}
                      className="bg-gray-900 rounded-lg p-2 flex flex-col items-center"
                    >
                      <span className="text-xs mb-1 truncate">
                        {linea.nombre}
                      </span>
                      <div className="w-16 h-16 relative mb-1">
                        <Doughnut
                          data={{
                            labels: [],
                            datasets: [
                              {
                                data: [
                                  linea.oee,
                                  Math.max(0, 100 - linea.oee),
                                ],
                                backgroundColor: ["#22c55e", "#111827"],
                                borderWidth: 0,
                                cutout: "70%",
                              },
                            ],
                          }}
                          options={{
                            plugins: { legend: { display: false } },
                            maintainAspectRatio: false,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs font-semibold text-yellow-300">
                            {linea.oee.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 text-center">
                        Disp {linea.disp.toFixed(0)}% · Rend{" "}
                        {linea.rend.toFixed(0)}% · Cal{" "}
                        {linea.cal.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ================== VISTA COMPARATIVA ================== */}
      {modoVista === "comparativo" && (
        <div className="mt-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setModoComparativo("linea")}
              className={`px-4 py-2 rounded-l ${
                modoComparativo === "linea" ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              Línea / Equipo
            </button>
            <button
              onClick={() => setModoComparativo("turno")}
              className={`px-4 py-2 rounded-r ${
                modoComparativo === "turno" ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              Turno
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-5xl mx-auto">
            <Bar data={dataComparativo} />
          </div>

          <div className="bg-gray-800 p-4 rounded-xl mt-8 overflow-x-auto max-w-5xl mx-auto">
            <h2 className="text-lg text-indigo-400 mb-3 font-semibold text-center">
              📋 Promedios por {modoComparativo === "turno" ? "Turno" : "Línea"}
            </h2>
            <table className="min-w-full text-sm text-left border border-gray-700">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Disp (%)</th>
                  <th className="px-3 py-2">Rend (%)</th>
                  <th className="px-3 py-2">Calid (%)</th>
                  <th className="px-3 py-2 text-yellow-300">OEE (%)</th>
                </tr>
              </thead>
              <tbody>
                {promediosComparativos.map((p, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-3 py-1">{p.nombre}</td>
                    <td className="px-3 py-1">{p.disponibilidad}</td>
                    <td className="px-3 py-1">{p.rendimiento}</td>
                    <td className="px-3 py-1">{p.calidad}</td>
                    <td className="px-3 py-1 font-bold text-yellow-400">
                      {p.oee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
