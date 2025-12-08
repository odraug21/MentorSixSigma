// src/pages/KPI/KpiKaizen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api";

export default function KpiKaizen() {
  const navigate = useNavigate();

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [lineaFiltro, setLineaFiltro] = useState("");
  const [turnoFiltro, setTurnoFiltro] = useState("");
  const [analisis, setAnalisis] = useState([]);
  const [metas, setMetas] = useState(null);
  const [resumenIA, setResumenIA] = useState(""); // 🔹 resumen global IA (opcional)
  const [cargando, setCargando] = useState(false);

  const cargarAnalisis = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (lineaFiltro) params.append("linea", lineaFiltro);
      if (turnoFiltro) params.append("turno", turnoFiltro);
      // 👇 flag opcional para que el backend sepa que debe usar IA
      params.append("conIA", "1");

      const qs = params.toString();
      const url = qs ? `/kaizen/analisis?${qs}` : "/kaizen/analisis";

      const resp = await apiGet(url);

      if (resp.ok) {
        setAnalisis(resp.lineas || []);
        setMetas(resp.metas || null);
        setResumenIA(resp.resumen_ia || "");
      } else if (Array.isArray(resp)) {
        // Soporte por si el backend retorna directamente el array
        setAnalisis(resp);
        setMetas(null);
        setResumenIA("");
      } else {
        setAnalisis([]);
        setMetas(null);
        setResumenIA("");
      }
    } catch (err) {
      console.error("❌ Error cargando análisis Kaizen:", err);
      setAnalisis([]);
      setMetas(null);
      setResumenIA("");
    } finally {
      setCargando(false);
    }
  };

  // 🔹 Helpers para filtros de semana / día
  const aplicarSemanaActual = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes, ...
    const offset = diaSemana === 0 ? -6 : 1 - diaSemana; // Lunes como inicio
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + offset);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const formato = (d) => d.toISOString().slice(0, 10);
    setDesde(formato(lunes));
    setHasta(formato(domingo));
  };

  const aplicarHoy = () => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);
    setDesde(hoyStr);
    setHasta(hoyStr);
  };

  // 👇 Carga inicial sin filtros
  useEffect(() => {
    cargarAnalisis();
    
  }, []);

  const limpiarFiltros = () => {
    setDesde("");
    setHasta("");
    setLineaFiltro("");
    setTurnoFiltro("");
    setResumenIA("");
    cargarAnalisis();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        ♻️ Análisis Kaizen basado en OEE
      </h1>

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-xl shadow max-w-5xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Línea / Equipo
            </label>
            <input
              type="text"
              value={lineaFiltro}
              onChange={(e) => setLineaFiltro(e.target.value)}
              placeholder="Ej: L1"
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Turno</label>
            <select
              value={turnoFiltro}
              onChange={(e) => setTurnoFiltro(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="">Todos</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
              <option value="Fin de semana">Fin de semana</option>
            </select>
          </div>
        </div>

        {/* Filtros rápidos Semana / Día */}
        <div className="mt-4 flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={aplicarSemanaActual}
              className="bg-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-600"
            >
              Semana actual
            </button>
            <button
              type="button"
              onClick={aplicarHoy}
              className="bg-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-600"
            >
              Hoy
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={cargarAnalisis}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Aplicar filtros
            </button>
            <button
              onClick={limpiarFiltros}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Metas de referencia */}
      {metas && (
        <div className="max-w-5xl mx-auto mb-4 text-sm text-gray-300">
          <p className="mb-1">
            🎯 <span className="font-semibold">Metas de referencia:</span>{" "}
            OEE ≥ {metas.oee}% | Disp ≥ {metas.disp}% | Rend ≥ {metas.rend}% |
            Cal ≥ {metas.cal}%
          </p>
        </div>
      )}

      {/* Resumen IA global (opcional) */}
      {resumenIA && (
        <div className="max-w-5xl mx-auto mb-6 bg-gray-800 border border-green-500/50 rounded-xl p-4 text-sm">
          <h2 className="text-green-400 font-semibold mb-2">
            🤖 Resumen estratégico IA
          </h2>
          <p className="text-gray-200 whitespace-pre-line">{resumenIA}</p>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto space-y-4">
        {cargando && (
          <p className="text-center text-gray-400">Cargando análisis Kaizen…</p>
        )}

        {!cargando && analisis.length === 0 && (
          <p className="text-center text-gray-400">
            No hay datos de OEE para los filtros seleccionados.
          </p>
        )}

        {!cargando &&
          analisis.map((l, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow"
            >
              <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                <h2 className="text-xl font-semibold text-indigo-300">
                  🏭 Línea {l.linea}
                  {l.turno && (
                    <span className="ml-2 text-sm text-gray-300">
                      | Turno {l.turno}
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span>
                    OEE:{" "}
                    <span className="font-bold text-yellow-300">
                      {Number(l.oee || 0).toFixed(2)}%
                    </span>
                  </span>
                  <span>Disp: {Number(l.disponibilidad || 0).toFixed(2)}%</span>
                  <span>Rend: {Number(l.rendimiento || 0).toFixed(2)}%</span>
                  <span>Cal: {Number(l.calidad || 0).toFixed(2)}%</span>
                  <span className="text-red-300">
                    Pérdidas: $
                    {Number(l.costo_total || l.costo_total_perdidas || 0).toLocaleString(
                      "es-CL"
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Problemas */}
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">
                    🚨 Problemas detectados
                  </h3>
                  {Array.isArray(l.problemas) && l.problemas.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-200">
                      {l.problemas.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">Sin problemas destacados.</p>
                  )}
                </div>

                {/* Sugerencias por reglas (actuales) */}
                <div>
                  <h3 className="font-semibold text-green-300 mb-1">
                    💡 Sugerencias Kaizen (reglas)
                  </h3>
                  {Array.isArray(l.sugerencias) && l.sugerencias.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-200">
                      {l.sugerencias.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">
                      Aún no hay sugerencias basadas en reglas.
                    </p>
                  )}
                </div>

                {/* Sugerencias IA */}
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">
                    🤖 Sugerencias Kaizen IA
                  </h3>
                  {Array.isArray(l.sugerencias_ia) &&
                  l.sugerencias_ia.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-200">
                      {l.sugerencias_ia.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : l.resumen_ia ? (
                    <p className="text-gray-200 whitespace-pre-line">
                      {l.resumen_ia}
                    </p>
                  ) : (
                    <p className="text-gray-400">
                      Aún no hay sugerencias generadas por IA para este filtro.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/kpi/dashboard")}
            className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
          >
            Volver al Panel LEAN
          </button>
        </div>
      </div>
    </div>
  );
}
