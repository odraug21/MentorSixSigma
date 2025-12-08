// src/pages/TEEP/TeepDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiGet } from "../../utils/api";

export default function TeepDashboard() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de filtro
  const [filtroLinea, setFiltroLinea] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const formatearFecha = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 📥 Cargar datos desde backend
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/teep");
        if (resp.ok) {
          setRegistros(resp.registros || []);
        } else {
          console.error("Error API listar TEEP:", resp);
        }
      } catch (err) {
        console.error("❌ Error cargando TEEP:", err);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  // 🔢 Recalcular TEEP por consistencia (por si el backend no lo recalcula)
  const calcularTEEPDesdeRegistro = (r) => {
    const cal = Number(r.tiempo_calendario_min) || 0;
    const plan = Number(r.tiempo_planificado_min) || 0;
    const op = Number(r.tiempo_operativo_min) || 0;
    const prodTeo = Number(r.produccion_teorica) || 0;
    const prodReal = Number(r.produccion_real) || 0;
    const ub = Number(r.unidades_buenas) || 0;
    const ut = Number(r.unidades_totales) || 0;

    if (!cal || !plan || !op || !prodTeo || !prodReal || !ub || !ut) return 0;

    const disponibilidad = op / plan;
    const rendimiento = prodReal / prodTeo;
    const calidad = ub / ut;
    const utilizacion = plan / cal;

    return disponibilidad * rendimiento * calidad * utilizacion * 100;
  };

  // 🎯 Aplicar filtros dinámicamente
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const fechaStr = r.fecha; // viene como YYYY-MM-DD
      const fechaValida =
        (!fechaInicio || fechaStr >= fechaInicio) &&
        (!fechaFin || fechaStr <= fechaFin);
      const lineaValida = !filtroLinea || r.linea === filtroLinea;
      const turnoValido = !filtroTurno || r.turno === filtroTurno;
      return fechaValida && lineaValida && turnoValido;
    });
  }, [registros, filtroLinea, filtroTurno, fechaInicio, fechaFin]);

  // 🧮 Normalizar / calcular TEEP y asegurar que SIEMPRE sea Number
  const dataConTeep = useMemo(
    () =>
      registrosFiltrados.map((r) => {
        let baseTeep =
          r.teep !== undefined && r.teep !== null && r.teep !== ""
            ? Number(r.teep)
            : calcularTEEPDesdeRegistro(r);

        if (!Number.isFinite(baseTeep)) baseTeep = 0;

        const teepRedondeado = Number(baseTeep.toFixed(2));

        return {
          ...r,
          teep: teepRedondeado,
        };
      }),
    [registrosFiltrados]
  );

  // 📊 Promedio general TEEP
  const promedioTEEP =
    dataConTeep.length > 0
      ? (
          dataConTeep.reduce(
            (sum, r) => sum + (Number(r.teep) || 0),
            0
          ) / dataConTeep.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6">
        📊 Dashboard TEEP
      </h1>

      {/* Botones superiores */}
      <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-6">
        <button
          onClick={() => navigate("/teep/intro")}
          className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Volver al Menú TEEP
        </button>
        <button
          onClick={() => navigate("/teep/builder")}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Ir al Registro Diario
        </button>
      </div>

      {cargando ? (
        <div className="text-center text-gray-400 mt-10">
          Cargando datos de TEEP...
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            />
            <select
              value={filtroLinea}
              onChange={(e) => setFiltroLinea(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            >
              <option value="">Todas las Líneas</option>
              {Array.from(new Set(registros.map((r) => r.linea)))
                .filter((l) => l && l.trim() !== "")
                .map((linea, i) => (
                  <option key={i} value={linea}>
                    {linea}
                  </option>
                ))}
            </select>
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            >
              <option value="">Todos los Turnos</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>

          {/* Métricas generales */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-center">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Promedio TEEP
            </h2>
            <p className="text-5xl font-bold text-green-400">
              {promedioTEEP}%
            </p>
          </div>

          {/* Gráfico de tendencia */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-indigo-400 mb-4 text-center">
              Tendencia del TEEP en el tiempo
            </h2>
            {dataConTeep.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataConTeep}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#ccc"
                    tickFormatter={formatearFecha}
                  />
                  <YAxis domain={[0, 100]} stroke="#ccc" />
                  <Tooltip
                    formatter={(value) =>
                      `${Number(value || 0).toFixed(2)} %`
                    }
                    labelFormatter={(label) => `Fecha: ${formatearFecha(label)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="teep"
                    stroke="#22c55e"
                    name="TEEP (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center">
                No hay datos disponibles para los filtros seleccionados.
              </p>
            )}
          </div>

          {/* Tabla de resultados */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="p-2">Fecha</th>
                  <th>Línea</th>
                  <th>Turno</th>
                  <th>TEEP (%)</th>
                  <th>Disponibilidad</th>
                  <th>Rendimiento</th>
                  <th>Calidad</th>
                  <th>Utilización</th>
                </tr>
              </thead>
              <tbody>
                {dataConTeep.map((r, i) => {
                  const cal = Number(r.tiempo_calendario_min) || 0;
                  const plan = Number(r.tiempo_planificado_min) || 0;
                  const op = Number(r.tiempo_operativo_min) || 0;
                  const prodTeo = Number(r.produccion_teorica) || 0;
                  const prodReal = Number(r.produccion_real) || 0;
                  const ub = Number(r.unidades_buenas) || 0;
                  const ut = Number(r.unidades_totales) || 0;

                  const disponibilidad = plan ? (op / plan) * 100 : 0;
                  const rendimiento = prodTeo ? (prodReal / prodTeo) * 100 : 0;
                  const calidad = ut ? (ub / ut) * 100 : 0;
                  const utilizacion = cal ? (plan / cal) * 100 : 0;

                  return (
                    <tr
                      key={i}
                      className="border-t border-gray-700 text-center hover:bg-gray-800/40"
                    >
                      <td className="p-2">{formatearFecha(r.fecha)}</td>
                      <td>{r.linea}</td>
                      <td>{r.turno}</td>
                      <td className="text-green-400 font-semibold">
                        {Number(r.teep || 0).toFixed(2)}%
                      </td>
                      <td>{disponibilidad.toFixed(1)}%</td>
                      <td>{rendimiento.toFixed(1)}%</td>
                      <td>{calidad.toFixed(1)}%</td>
                      <td>{utilizacion.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
