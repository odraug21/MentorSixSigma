// src/pages/TEEP/TeepDashboard.jsx
import React, { useState, useMemo } from "react";
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

export default function TeepDashboard() {
  const navigate = useNavigate();

  // Cargar datos guardados
  const registros = JSON.parse(localStorage.getItem("teep-data")) || [];

  // Estados de filtro
  const [filtroLinea, setFiltroLinea] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Función para calcular TEEP
  const calcularTEEP = (r) => {
    if (
      !r.tiempoCalendario ||
      !r.tiempoPlanificado ||
      !r.tiempoOperativo ||
      !r.produccionTeorica ||
      !r.produccionReal ||
      !r.unidadesBuenas ||
      !r.unidadesTotales
    )
      return 0;

    const disponibilidad = r.tiempoOperativo / r.tiempoPlanificado;
    const rendimiento = r.produccionReal / r.produccionTeorica;
    const calidad = r.unidadesBuenas / r.unidadesTotales;
    const utilizacion = r.tiempoPlanificado / r.tiempoCalendario;

    return disponibilidad * rendimiento * calidad * utilizacion * 100;
  };

  // Aplicar filtros dinámicamente
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const fechaValida =
        (!fechaInicio || r.fecha >= fechaInicio) &&
        (!fechaFin || r.fecha <= fechaFin);
      const lineaValida = !filtroLinea || r.linea === filtroLinea;
      const turnoValido = !filtroTurno || r.turno === filtroTurno;
      return fechaValida && lineaValida && turnoValido;
    });
  }, [registros, filtroLinea, filtroTurno, fechaInicio, fechaFin]);

  // Agregar cálculo de TEEP
  const dataConTeep = registrosFiltrados.map((r) => ({
    ...r,
    teep: calcularTEEP(r).toFixed(2),
  }));

  // Calcular promedio
  const promedioTEEP =
    dataConTeep.length > 0
      ? (
          dataConTeep.reduce((sum, r) => sum + parseFloat(r.teep), 0) /
          dataConTeep.length
        ).toFixed(2)
      : 0;

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

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="bg-gray-700 p-2 rounded"
          placeholder="Desde"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="bg-gray-700 p-2 rounded"
          placeholder="Hasta"
        />
<select
  value={filtroLinea}
  onChange={(e) => setFiltroLinea(e.target.value)}
  className="bg-gray-700 p-2 rounded"
>
  <option value="">Todas las Líneas</option>
  {Array.from(new Set(registros.map((r) => r.linea))) // 🔹 elimina duplicados
    .filter((l) => l && l.trim() !== "") // 🔹 evita vacíos
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
        <p className="text-5xl font-bold text-green-400">{promedioTEEP}%</p>
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
              <XAxis dataKey="fecha" stroke="#ccc" />
              <YAxis domain={[0, 100]} stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="teep" stroke="#22c55e" name="TEEP (%)" />
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
              const disponibilidad = (r.tiempoOperativo / r.tiempoPlanificado) * 100;
              const rendimiento = (r.produccionReal / r.produccionTeorica) * 100;
              const calidad = (r.unidadesBuenas / r.unidadesTotales) * 100;
              const utilizacion = (r.tiempoPlanificado / r.tiempoCalendario) * 100;

              return (
                <tr key={i} className="border-t border-gray-700 text-center hover:bg-gray-800/40">
                  <td className="p-2">{r.fecha}</td>
                  <td>{r.linea}</td>
                  <td>{r.turno}</td>
                  <td className="text-green-400 font-semibold">{r.teep}%</td>
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
    </div>
  );
}
