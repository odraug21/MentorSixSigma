// src/pages/OEE/OeeBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";

// 🔹 Listas globales
const TIPOS_FALLA = [
  { value: "", label: "Seleccionar tipo" },
  { value: "DISPONIBILIDAD", label: "Disponibilidad (Paradas)" },
  { value: "RENDIMIENTO", label: "Rendimiento (Velocidad / microparadas)" },
  { value: "CALIDAD", label: "Calidad (Scrap / retrabajos)" },
];

const CAUSAS_PARADA = [
  "Falla mecánica",
  "Falla eléctrica",
  "Cambio de formato / setup",
  "Limpieza / sanitización",
  "Mantención planificada",
  "Falta de materia prima",
  "Falta de personal / operador",
  "Bloqueos / atascos",
  "Problemas de calidad",
  "Parada por seguridad",
  "Otros",
];

export default function OeeBuilder() {
  const navigate = useNavigate();

  // ===============================
  // 📌 Registro del día
  // ===============================
  const [registro, setRegistro] = useState({
    fecha: new Date().toISOString().split("T")[0],
    linea: "",
    turno: "",
    tiempoPlanificado: "",
    tiempoParadas: "",
    unidadesProducidas: "",
    unidadesBuenas: "",
    velocidadIdeal: "",
    observaciones: "",
    costoHora: "",
    costoUnitario: "",
  });

  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  // ===============================
  // 📌 PARADAS (DETALLE)
  // ===============================
  const [parada, setParada] = useState({
    hora: "",
    causa: "",
    minutos: "",
    tipo_falla: "",
    comentario: "",
  });

  const [listaParadas, setListaParadas] = useState([]);

  const handleParada = (e) => {
    setParada({ ...parada, [e.target.name]: e.target.value });
  };

  const agregarParada = () => {
    if (!parada.hora || !parada.causa || !parada.minutos) {
      alert("Completa al menos HORA, CAUSA y MINUTOS.");
      return;
    }
    setListaParadas((prev) => [...prev, parada]);
    setParada({
      hora: "",
      causa: "",
      minutos: "",
      tipo_falla: "",
      comentario: "",
    });
  };

  const eliminarParada = (i) => {
    setListaParadas((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ===============================
  // 📌 Carga Historial
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/oee/registros?limit=50");
        if (resp.ok && Array.isArray(resp.registros)) {
          const ordenado = resp.registros.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setHistorial(ordenado);
          localStorage.setItem("oee-historial", JSON.stringify(ordenado));
          return;
        }
      } catch (err) {
        console.error("No se pudo cargar desde API:", err);
      }
      // fallback localStorage (si quieres mantenerlo)
      const data = localStorage.getItem("oee-historial");
      if (data) {
        setHistorial(JSON.parse(data));
      }
    })();
  }, []);

  // ===============================
  // 📌 Manejo de campos día
  // ===============================
  const handleChange = (e) => {
    setRegistro({ ...registro, [e.target.name]: e.target.value });
  };

  // ===============================
  // 📌 Cálculo OEE
  // ===============================
  const calcularOEE = () => {
    const {
      tiempoPlanificado,
      tiempoParadas,
      unidadesProducidas,
      unidadesBuenas,
      velocidadIdeal,
      costoHora,
      costoUnitario,
    } = registro;

    if (
      !tiempoPlanificado ||
      !unidadesProducidas ||
      !unidadesBuenas ||
      !velocidadIdeal
    ) {
      alert("Completa campos obligatorios para calcular OEE.");
      return;
    }

    const plan = Number(tiempoPlanificado);
    const paradas = Number(tiempoParadas || 0);
    const prod = Number(unidadesProducidas);
    const buenas = Number(unidadesBuenas);
    const ideal = Number(velocidadIdeal);

    if (plan <= 0 || prod <= 0 || buenas < 0 || ideal <= 0) {
      alert("Revisa los valores numéricos, hay algo inválido.");
      return;
    }

    const disponibilidad = ((plan - paradas) / plan) * 100;
    const rendimiento = (prod / (plan * ideal)) * 100;
    const calidad = (buenas / prod) * 100;
    const oee = (disponibilidad * rendimiento * calidad) / 10000;

    // 💰 costos
    const horasParada = paradas / 60;
    const costoH = Number(costoHora || 0);
    const costoU = Number(costoUnitario || 0);

    const unidadesMalas = Math.max(prod - buenas, 0);
    const teoricas = Math.max((plan - paradas) * ideal, 0);
    const perdidasRend = Math.max(teoricas - prod, 0);

    const costoParadas = horasParada * costoH;
    const costoScrap = unidadesMalas * costoU;
    const costoRend = perdidasRend * costoU;
    const costoTotal = costoParadas + costoScrap + costoRend;

    setResultado({
      ...registro,
      disponibilidad: disponibilidad.toFixed(2),
      rendimiento: rendimiento.toFixed(2),
      calidad: calidad.toFixed(2),
      oee: oee.toFixed(2),
      costoParadas,
      costoScrap,
      costoRend,
      costoTotal,
    });
  };

  // ===============================
  // 📌 Guardar registro completo
  // ===============================
  const guardarRegistro = async () => {
    if (!resultado) return alert("Primero calcula el OEE.");

    try {
      // 1️⃣ Guardamos registro del día
      const resp = await apiPost("/oee/registros", resultado);

      if (!resp.ok) {
        alert("Error guardando el registro principal");
        return;
      }

      const registroId = resp.registro.id;

      // 2️⃣ Guardamos N paradas
      for (const p of listaParadas) {
        await apiPost("/oee/paradas", {
          registro_id: registroId,
          hora: p.hora,
          causa: p.causa,
          minutos: Number(p.minutos),
          tipo_falla: p.tipo_falla,
          comentario: p.comentario,
        });
      }

      alert("Registro OEE + Paradas guardado exitosamente ✔️");

      setListaParadas([]);
      setResultado(null);

      // opcional: recargar historial sin sacar al usuario
      const recarga = await apiGet("/oee/registros?limit=50");
      if (recarga.ok && Array.isArray(recarga.registros)) {
        const ordenado = recarga.registros.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setHistorial(ordenado);
        localStorage.setItem("oee-historial", JSON.stringify(ordenado));
      }

      // si quieres ir al dashboard:
      // navigate("/oee/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error guardando datos.");
    }
  };

  const formatearFechaHora = (iso) => {
    if (!iso) return "-";
    const fecha = new Date(iso);
    return fecha.toLocaleString("es-CL");
  };

  // ======================================================
  // 🔥 RENDER PRINCIPAL
  // ======================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        🧮 Registro Diario OEE — Modo Profesional
      </h1>

      {/* =====================================================
        FORMULARIO PRINCIPAL — HORIZONTAL
      ====================================================== */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fecha */}
          <div>
            <label className="text-sm text-gray-400">📅 Fecha</label>
            <input
              type="date"
              name="fecha"
              value={registro.fecha}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Línea */}
          <div>
            <label className="text-sm text-gray-400">🏭 Línea</label>
            <input
              type="text"
              name="linea"
              placeholder="Línea A1"
              value={registro.linea}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Turno */}
          <div>
            <label className="text-sm text-gray-400">👷 Turno</label>
            <select
              name="turno"
              value={registro.turno}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="">Seleccionar</option>
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
            </select>
          </div>

          {/* Planificado */}
          <div>
            <label className="text-sm text-gray-400">⏱ Planificado (min)</label>
            <input
              type="number"
              name="tiempoPlanificado"
              value={registro.tiempoPlanificado}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Paradas */}
          <div>
            <label className="text-sm text-gray-400">
              🛑 Paradas Totales (min)
            </label>
            <input
              type="number"
              name="tiempoParadas"
              value={registro.tiempoParadas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Ideal */}
          <div>
            <label className="text-sm text-gray-400">
              ⚙️ Velocidad Ideal (unid/min)
            </label>
            <input
              type="number"
              name="velocidadIdeal"
              value={registro.velocidadIdeal}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Producidas */}
          <div>
            <label className="text-sm text-gray-400">📦 Producidas</label>
            <input
              type="number"
              name="unidadesProducidas"
              value={registro.unidadesProducidas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Buenas */}
          <div>
            <label className="text-sm text-gray-400">✅ Buenas</label>
            <input
              type="number"
              name="unidadesBuenas"
              value={registro.unidadesBuenas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Costos */}
          <div>
            <label className="text-sm text-gray-400">💸 Costo hora</label>
            <input
              type="number"
              name="costoHora"
              value={registro.costoHora}
              onChange={handleChange}
              placeholder="60000"
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">📘 Costo unitario</label>
            <input
              type="number"
              name="costoUnitario"
              value={registro.costoUnitario}
              onChange={handleChange}
              placeholder="500"
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        </div>

        {/* OBSERVACIONES */}
        <label className="text-sm text-gray-400 mt-4 block">📝 Observaciones</label>
        <textarea
          name="observaciones"
          value={registro.observaciones}
          onChange={handleChange}
          rows="2"
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>

      {/* =====================================================
        FORMULARIO DE PARADAS
      ====================================================== */}
      <div className="bg-gray-800 p-6 rounded-xl max-w-6xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-indigo-300 mb-4">
          🔧 Registro de Paradas (Detalle)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
          <div>
            <label className="text-sm text-gray-400">Hora</label>
            <input
              type="time"
              name="hora"
              value={parada.hora}
              onChange={handleParada}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Causa</label>
            <select
              name="causa"
              value={parada.causa}
              onChange={handleParada}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="">Seleccionar</option>
              {CAUSAS_PARADA.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Minutos</label>
            <input
              type="number"
              name="minutos"
              value={parada.minutos}
              onChange={handleParada}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Tipo Falla</label>
            <select
              name="tipo_falla"
              value={parada.tipo_falla}
              onChange={handleParada}
              className="w-full p-2 bg-gray-700 rounded"
            >
              {TIPOS_FALLA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Comentario</label>
            <input
              type="text"
              name="comentario"
              value={parada.comentario}
              onChange={handleParada}
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Detalle corto"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={agregarParada}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Agregar Parada
        </button>

        {/* TABLA PARADAS */}
        {listaParadas.length > 0 && (
          <table className="mt-4 w-full border border-gray-700 text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-2 py-1">Hora</th>
                <th className="px-2 py-1">Causa</th>
                <th className="px-2 py-1">Min</th>
                <th className="px-2 py-1">Tipo</th>
                <th className="px-2 py-1">Comentario</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listaParadas.map((p, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-2 py-1">{p.hora}</td>
                  <td className="px-2 py-1">{p.causa}</td>
                  <td className="px-2 py-1">{p.minutos}</td>
                  <td className="px-2 py-1">{p.tipo_falla}</td>
                  <td className="px-2 py-1">{p.comentario}</td>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => eliminarParada(i)}
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =====================================================
        BLOQUE RESULTADO DEL DÍA  ✅
      ====================================================== */}
      {resultado && (
        <div className="bg-gray-800 p-6 rounded-xl max-w-4xl mx-auto mb-10 text-center">
          <h2 className="text-2xl font-bold text-indigo-300 mb-3">
            Resultado del Día
          </h2>
          <p>Disponibilidad: {resultado.disponibilidad}%</p>
          <p>Rendimiento: {resultado.rendimiento}%</p>
          <p>Calidad: {resultado.calidad}%</p>
          <p className="text-yellow-400 font-bold mt-2 text-lg">
            OEE: {resultado.oee}%
          </p>

          <hr className="my-4 border-gray-700" />

          <h3 className="text-lg font-semibold text-green-400 mb-2">
            💸 Impacto Económico del Día
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p>
              <span className="text-gray-300">Costo por paradas: </span>
              <span className="font-semibold text-red-300">
                $
                {Number(resultado.costoParadas || 0).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">Costo por scrap / defectos: </span>
              <span className="font-semibold text-red-300">
                $
                {Number(resultado.costoScrap || 0).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">Costo por bajo rendimiento: </span>
              <span className="font-semibold text-red-300">
                $
                {Number(resultado.costoRend || 0).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">💰 Costo total de pérdidas: </span>
              <span className="font-bold text-yellow-300">
                $
                {Number(resultado.costoTotal || 0).toLocaleString("es-CL")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
        ACCIONES
      ====================================================== */}
      <div className="flex gap-3 justify-center flex-wrap mb-10">
        <button
          type="button"
          onClick={calcularOEE}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Calcular OEE
        </button>

        <button
          type="button"
          onClick={guardarRegistro}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          Guardar
        </button>

        <button
          type="button"
          onClick={() => navigate("/oee/dashboard")}
          className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => navigate("/oee/intro")}
          className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition"
        >
          Menú OEE
        </button>
      </div>

      {/* =====================================================
        HISTORIAL ÚLTIMOS REGISTROS
      ====================================================== */}
      {historial.length > 0 && (
        <div className="max-w-6xl mx-auto bg-gray-800 p-4 rounded-lg mb-20">
          <h2 className="text-xl font-bold text-indigo-400 mb-3">
            📋 Últimos registros
          </h2>

          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-2 py-1">Fecha</th>
                <th className="px-2 py-1">Línea</th>
                <th className="px-2 py-1">Turno</th>
                <th className="px-2 py-1">OEE (%)</th>
              </tr>
            </thead>
            <tbody>
              {historial.slice(0, 5).map((h, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-2 py-1">
                    {formatearFechaHora(h.created_at || h.fecha)}
                  </td>
                  <td className="px-2 py-1">{h.linea}</td>
                  <td className="px-2 py-1">{h.turno}</td>
                  <td className="px-2 py-1 text-yellow-400 font-bold">
                    {h.oee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
