// src/pages/KPI/KpiDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import KpiCard from "./KpiCard";
import KpiCharts from "./KpiCharts";
import { apiGet } from "../../utils/api";

export default function KpiDashboard() {
  const navigate = useNavigate();

  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [data, setData] = useState({ oee: [], ooe: [], teep: [] });
  const [cargando, setCargando] = useState(true);

// 🔹 Estado para análisis Kaizen
const [kaizen, setKaizen] = useState([]);
const [kaizenCargando, setKaizenCargando] = useState(true);
const [kaizenMetas, setKaizenMetas] = useState(null);
const [kaizenResumenIA, setKaizenResumenIA] = useState("");

  // 🔹 Cargar datos de KPIs desde el backend
  useEffect(() => {
    (async () => {
      try {
        const [respOee, respOoeApi, respTeep] = await Promise.all([
          apiGet("/oee/registros"), // OEE
          apiGet("/ooe"), // OOE
          apiGet("/teep"), // TEEP
        ]);

        setData({
          oee: respOee?.ok ? respOee.registros || [] : [],
          ooe: respOoeApi?.ok ? respOoeApi.registros || [] : [],
          teep: respTeep?.ok ? respTeep.registros || [] : [],
        });
      } catch (err) {
        console.error("❌ Error cargando KPIs Panel LEAN:", err);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

// 🔹 Cargar análisis Kaizen (resumen por línea)
useEffect(() => {
  const cargarKaizen = async () => {
    try {
      const resp = await apiGet("/kaizen/analisis?conIA=1");

      // Caso "completo" (lo mismo que usa KpiKaizen)
      if (resp?.ok) {
        setKaizen(resp.lineas || []);
        setKaizenMetas(resp.metas || null);
        setKaizenResumenIA(resp.resumen_ia || "");
      }
      // Caso legacy: el backend devuelve directamente un array
      else if (Array.isArray(resp)) {
        setKaizen(resp);
        setKaizenMetas(null);
        setKaizenResumenIA("");
      } else {
        setKaizen([]);
        setKaizenMetas(null);
        setKaizenResumenIA("");
      }
    } catch (err) {
      console.error("❌ Error cargando análisis Kaizen:", err);
      setKaizen([]);
      setKaizenMetas(null);
      setKaizenResumenIA("");
    } finally {
      setKaizenCargando(false);
    }
  };

  cargarKaizen();
}, []);


  // 🔹 Filtro por mes / año (para los KPIs de arriba)
  const filtrarDatos = (arr) => {
    return arr.filter((r) => {
      if (!r.fecha) return false;
      const fecha = new Date(r.fecha);
      if (Number.isNaN(fecha.getTime())) return false;

      const coincideAnio = filtroAnio
        ? fecha.getFullYear() === Number(filtroAnio)
        : true;
      const coincideMes = filtroMes
        ? fecha.getMonth() + 1 === Number(filtroMes)
        : true;

      return coincideAnio && coincideMes;
    });
  };

  // 🔹 Cálculo genérico de promedio
  const calcPromedio = (arr, key, calculadoraFallback) => {
    if (!arr.length) return 0;

    const valores = arr.map((r) => {
      const v = r[key];
      if (v !== null && v !== undefined && v !== "") {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
      if (calculadoraFallback) {
        const n = Number(calculadoraFallback(r));
        if (!Number.isNaN(n)) return n;
      }
      return 0;
    });

    const total = valores.reduce((acc, v) => acc + v, 0);
    return total / (valores.length || 1);
  };

  // 🔹 Fallback para TEEP (por si no viene el campo teep desde el backend)
  const calcularTeepDesdeRegistro = (r) => {
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

  // 🔹 KPIs filtrados (promedios tarjetas superiores)
  const oee = calcPromedio(filtrarDatos(data.oee), "oee");
  const ooe = calcPromedio(filtrarDatos(data.ooe), "ooe");
  const teep = calcPromedio(
    filtrarDatos(data.teep),
    "teep",
    calcularTeepDesdeRegistro
  );

  // 🔹 Datos para gráfico:
  //    - Sin mes seleccionado  -> promedio mensual (enero–dic)
  //    - Con mes seleccionado  -> promedio diario de ese mes
  const chartData = useMemo(() => {
    // Helper para filtrar sólo por año (para vista mensual)
    const filtrarPorAnioSolo = (arr) =>
      arr.filter((r) => {
        if (!r.fecha) return false;
        const f = new Date(r.fecha);
        if (Number.isNaN(f.getTime())) return false;
        if (!filtroAnio) return true;
        return f.getFullYear() === Number(filtroAnio);
      });

    // Vista mensual (barras de ene–dic)
    if (!filtroMes) {
      const baseOee = filtrarPorAnioSolo(data.oee);
      const baseOoe = filtrarPorAnioSolo(data.ooe);
      const baseTeep = filtrarPorAnioSolo(data.teep);

      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthName = new Date(2025, i).toLocaleString("es-CL", {
          month: "short",
        });

        const oeeM = calcPromedio(
          baseOee.filter((r) => {
            const f = new Date(r.fecha);
            return !Number.isNaN(f.getTime()) && f.getMonth() + 1 === month;
          }),
          "oee"
        );

        const ooeM = calcPromedio(
          baseOoe.filter((r) => {
            const f = new Date(r.fecha);
            return !Number.isNaN(f.getTime()) && f.getMonth() + 1 === month;
          }),
          "ooe"
        );

        const teepM = calcPromedio(
          baseTeep.filter((r) => {
            const f = new Date(r.fecha);
            return !Number.isNaN(f.getTime()) && f.getMonth() + 1 === month;
          }),
          "teep",
          calcularTeepDesdeRegistro
        );

        return { mes: monthName, OEE: oeeM, OOE: ooeM, TEEP: teepM };
      });
    }

    // Vista diaria (barras por día del mes seleccionado)
    const mesNum = Number(filtroMes);
    const yearFilter = filtroAnio ? Number(filtroAnio) : null;

    const filtrarPorMesYAnio = (arr) =>
      arr.filter((r) => {
        if (!r.fecha) return false;
        const f = new Date(r.fecha);
        if (Number.isNaN(f.getTime())) return false;
        if (f.getMonth() + 1 !== mesNum) return false;
        if (yearFilter && f.getFullYear() !== yearFilter) return false;
        return true;
      });

    const baseOee = filtrarPorMesYAnio(data.oee);
    const baseOoe = filtrarPorMesYAnio(data.ooe);
    const baseTeep = filtrarPorMesYAnio(data.teep);

    // Tomamos un año base para el cálculo de días en el mes
    let yearBase = yearFilter;
    if (!yearBase) {
      const any =
        baseOee[0] || baseOoe[0] || baseTeep[0] || { fecha: new Date() };
      const fAny = new Date(any.fecha);
      yearBase = Number.isNaN(fAny.getTime())
        ? new Date().getFullYear()
        : fAny.getFullYear();
    }

    const daysInMonth = new Date(yearBase, mesNum, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;

      const oeeD = calcPromedio(
        baseOee.filter((r) => {
          const f = new Date(r.fecha);
          return !Number.isNaN(f.getTime()) && f.getDate() === day;
        }),
        "oee"
      );

      const ooeD = calcPromedio(
        baseOoe.filter((r) => {
          const f = new Date(r.fecha);
          return !Number.isNaN(f.getTime()) && f.getDate() === day;
        }),
        "ooe"
      );

      const teepD = calcPromedio(
        baseTeep.filter((r) => {
          const f = new Date(r.fecha);
          return !Number.isNaN(f.getTime()) && f.getDate() === day;
        }),
        "teep",
        calcularTeepDesdeRegistro
      );

      // Usamos la misma clave "mes" para no tocar KpiCharts,
      // pero ahora representa el día del mes.
      return {
        mes: day.toString().padStart(2, "0"),
        OEE: oeeD,
        OOE: ooeD,
        TEEP: teepD,
      };
    });
  }, [data, filtroAnio, filtroMes]);

  // 🔹 Años disponibles (de todos los registros)
  const aniosDisponibles = useMemo(() => {
    const años = [...data.oee, ...data.ooe, ...data.teep]
      .map((r) => {
        if (!r.fecha) return null;
        const f = new Date(r.fecha);
        return Number.isNaN(f.getTime()) ? null : f.getFullYear();
      })
      .filter(Boolean);

    return Array.from(new Set(años)).sort();
  }, [data]);

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6">
        📈 Dashboard Gerencial de KPIs
      </h1>

      {cargando ? (
        <div className="text-center text-gray-400 mt-10">
          Cargando datos desde el servidor...
        </div>
      ) : (
        <>
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
                  {new Date(2025, i).toLocaleString("es-CL", {
                    month: "long",
                  })}
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

          {/* Gráfico comparativo (mensual o diario según filtro) */}
          <KpiCharts data={chartData} />

          {/* 🟩 --- SECCIÓN: Análisis Kaizen (embebido) --- */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-10 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
              ♻️ Análisis Kaizen por Línea
            </h2>

            {/* Metas de referencia */}
            {kaizenMetas && (
              <div className="mb-4 text-sm text-gray-300">
                <p className="mb-1 text-center">
                  🎯 <span className="font-semibold">Metas de referencia:</span>{" "}
                  OEE ≥ {kaizenMetas.oee}% | Disp ≥ {kaizenMetas.disp}% | Rend ≥{" "}
                  {kaizenMetas.rend}% | Cal ≥ {kaizenMetas.cal}%
                </p>
              </div>
            )}

            {/* Resumen IA global */}
            {kaizenResumenIA && (
              <div className="mb-6 bg-gray-900 border border-green-500/50 rounded-xl p-4 text-sm">
                <h3 className="text-green-400 font-semibold mb-2 text-center">
                  🤖 Resumen estratégico IA
                </h3>
                <p className="text-gray-200 whitespace-pre-line text-center">
                  {kaizenResumenIA}
                </p>
              </div>
            )}

            {kaizenCargando && (
              <p className="text-center text-gray-400">
                Cargando análisis Kaizen...
              </p>
            )}

            {!kaizenCargando && kaizen.length === 0 && (
              <p className="text-center text-gray-400">
                No hay datos suficientes para análisis Kaizen todavía.
              </p>
            )}

            <div className="space-y-6">
              {kaizen.map((l, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow"
                >
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-indigo-300">
                      🏭 Línea {l.linea}
                      {l.turno && (
                        <span className="ml-2 text-sm text-gray-300">
                          | Turno {l.turno}
                        </span>
                      )}
                    </h3>

                    <div className="text-sm flex gap-4 flex-wrap">
                      <span>
                        OEE:{" "}
                        <span className="font-bold text-yellow-300">
                          {Number(l.oee || 0).toFixed(2)}%
                        </span>
                      </span>
                      <span>
                        Disp: {Number(l.disponibilidad || 0).toFixed(2)}%
                      </span>
                      <span>
                        Rend: {Number(l.rendimiento || 0).toFixed(2)}%
                      </span>
                      <span>
                        Calid: {Number(l.calidad || 0).toFixed(2)}%
                      </span>
                      <span className="text-red-300">
                        Pérdidas: $
                        {Number(
                          l.costo_total_perdidas ?? l.costo_total ?? 0
                        ).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>

                  {/* Igual que en KpiKaizen: 3 columnas -> Problemas, Sugerencias reglas, Sugerencias IA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Problemas */}
                    <div>
                      <h4 className="font-semibold text-red-300 mb-1">
                        🚨 Problemas detectados
                      </h4>
                      {Array.isArray(l.problemas) && l.problemas.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {l.problemas.map((p, i) => (
                            <li key={i} className="text-gray-300">
                              {p}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">
                          Sin problemas destacados.
                        </p>
                      )}
                    </div>

                    {/* Sugerencias por reglas */}
                    <div>
                      <h4 className="font-semibold text-green-300 mb-1">
                        💡 Sugerencias Kaizen (reglas)
                      </h4>
                      {Array.isArray(l.sugerencias) &&
                      l.sugerencias.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {l.sugerencias.map((s, i) => (
                            <li key={i} className="text-gray-300">
                              {s}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">
                          Aún no hay sugerencias generadas por reglas.
                        </p>
                      )}
                    </div>

                    {/* Sugerencias IA */}
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">
                        🤖 Sugerencias Kaizen IA
                      </h4>
                      {Array.isArray(l.sugerencias_ia) &&
                      l.sugerencias_ia.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {l.sugerencias_ia.map((s, i) => (
                            <li key={i} className="text-gray-300">
                              {s}
                            </li>
                          ))}
                        </ul>
                      ) : l.resumen_ia ? (
                        <p className="text-gray-200 whitespace-pre-line">
                          {l.resumen_ia}
                        </p>
                      ) : (
                        <p className="text-gray-400">
                          Aún no hay sugerencias generadas por IA para esta
                          línea/turno.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
}
