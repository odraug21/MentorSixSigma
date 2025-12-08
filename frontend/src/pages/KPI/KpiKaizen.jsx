// src/pages/KPI/KpiKaizen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api";

export default function KpiKaizen() {
  const navigate = useNavigate();

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [lineaFiltro, setLineaFiltro] = useState("");
  const [analisis, setAnalisis] = useState([]);
  const [metas, setMetas] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarAnalisis = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (lineaFiltro) params.append("linea", lineaFiltro);

      const qs = params.toString();
      const url = qs ? `/kaizen/analisis?${qs}` : "/kaizen/analisis";

      const resp = await apiGet(url);

      if (resp.ok) {
        setAnalisis(resp.lineas || []);
        setMetas(resp.metas || null);
      } else {
        setAnalisis([]);
        setMetas(null);
      }
    } catch (err) {
      console.error("❌ Error cargando análisis Kaizen:", err);
      setAnalisis([]);
      setMetas(null);
    } finally {
      setCargando(false);
    }
  };

  // 👇 SIN comentarios eslint aquí
  useEffect(() => {
    cargarAnalisis();
  }, []);

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

          <div className="flex items-end gap-2">
            <button
              onClick={cargarAnalisis}
              className="flex-1 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Aplicar filtros
            </button>
            <button
              onClick={() => {
                setDesde("");
                setHasta("");
                setLineaFiltro("");
                cargarAnalisis();
              }}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Metas de referencia */}
      {metas && (
        <div className="max-w-5xl mx-auto mb-6 text-sm text-gray-300">
          <p className="mb-1">
            🎯 <span className="font-semibold">Metas de referencia:</span>{" "}
            OEE ≥ {metas.oee}% | Disp ≥ {metas.disp}% | Rend ≥ {metas.rend}% | Cal ≥{" "}
            {metas.cal}%
          </p>
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
                </h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span>
                    OEE:{" "}
                    <span className="font-bold text-yellow-300">
                      {l.oee}%
                    </span>
                  </span>
                  <span>Disp: {l.disponibilidad}%</span>
                  <span>Rend: {l.rendimiento}%</span>
                  <span>Cal: {l.calidad}%</span>
                  <span className="text-red-300">
                    Pérdidas: $
                    {Number(l.costo_total || 0).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">
                    🚨 Problemas detectados
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-200">
                    {l.problemas.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-green-300 mb-1">
                    💡 Sugerencias Kaizen
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-200">
                    {l.sugerencias.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
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
