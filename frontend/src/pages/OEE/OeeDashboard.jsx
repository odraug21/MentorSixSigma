import React, { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
  const [modoVista, setModoVista] = useState("filtrado"); // filtrado | comparativo
  const [modoComparativo, setModoComparativo] = useState("linea"); // linea | turno
  const navigate = useNavigate();
  // ✅ Cargar historial desde localStorage
  useEffect(() => {
    const data = localStorage.getItem("oee-historial");
    if (data) setHistorial(JSON.parse(data));
  }, []);

  // ✅ Hooks (todos antes de cualquier return)
  const lineasUnicas = useMemo(
    () => [...new Set(historial.map((h) => h.linea).filter(Boolean))],
    [historial]
  );

  const filtrado = useMemo(() => {
    return historial.filter((h) => {
      const fechaOk =
        (!filtros.desde || h.fecha >= filtros.desde) &&
        (!filtros.hasta || h.fecha <= filtros.hasta);
      const lineaOk = !filtros.linea || h.linea === filtros.linea;
      const turnoOk = !filtros.turno || h.turno === filtros.turno;
      return fechaOk && lineaOk && turnoOk;
    });
  }, [historial, filtros]);

  const promedio = (data, campo) =>
    (data.reduce((acc, r) => acc + parseFloat(r[campo] || 0), 0) /
      (data.length || 1)).toFixed(2);

  const avgDisp = promedio(filtrado, "disponibilidad");
  const avgRend = promedio(filtrado, "rendimiento");
  const avgCal = promedio(filtrado, "calidad");
  const avgOee = promedio(filtrado, "oee");

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

  // ✅ Data para gráficos
  const labels = filtrado.map((h) => h.fecha);
  const dataBar = {
    labels,
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
    labels,
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

  // ✅ Render condicional (después de los hooks)
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

  // ==============================================================
  // 🔹 RENDER PRINCIPAL
  // ==============================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">📊 Dashboard OEE</h1>

        {/* Selector de vista */}
        <div className="flex bg-gray-800 rounded overflow-hidden border border-gray-700">
          <button
            onClick={() => setModoVista("filtrado")}
            className={`px-4 py-2 ${
              modoVista === "filtrado" ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            Vista Filtrada
          </button>
          <button
            onClick={() => setModoVista("comparativo")}
            className={`px-4 py-2 ${
              modoVista === "comparativo" ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            Comparativo
          </button>
                    <button
            onClick={() => navigate("/oee/builder")}
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Ir al Registro OEE
          </button>
        </div>
      </div>

      {/* =========================================================
          🔸 VISTA FILTRADA
      ==========================================================*/}
      {modoVista === "filtrado" && (
        <>
          {/* Filtros */}
          <div className="bg-gray-800 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Línea / Equipo</label>
              <select
                value={filtros.linea}
                onChange={(e) => setFiltros({ ...filtros, linea: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded"
              >
                <option value="">Todas</option>
                {lineasUnicas.map((l, i) => (
                  <option key={i}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Turno</label>
              <select
                value={filtros.turno}
                onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded"
              >
                <option value="">Todos</option>
                <option>Mañana</option>
                <option>Tarde</option>
                <option>Noche</option>
              </select>
            </div>
          </div>

          {/* Promedios */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm">Disponibilidad</h3>
              <p className="text-2xl font-bold text-blue-400">{avgDisp}%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm">Rendimiento</h3>
              <p className="text-2xl font-bold text-green-400">{avgRend}%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 text-sm">Calidad</h3>
              <p className="text-2xl font-bold text-yellow-400">{avgCal}%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-400">
              <h3 className="text-gray-300 text-sm font-semibold">OEE Promedio</h3>
              <p className="text-2xl font-bold text-yellow-300">{avgOee}%</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <h2 className="text-lg mb-2 text-center text-gray-300">
                Factores D/R/C
              </h2>
              <Bar data={dataBar} />
            </div>

            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <h2 className="text-lg mb-2 text-center text-gray-300">
                Tendencia OEE
              </h2>
              <Line data={dataLine} />
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          🔸 VISTA COMPARATIVA
      ==========================================================*/}
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




