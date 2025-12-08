// src/pages/OEE/OeeBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../utils/api";

export default function OeeBuilder() {
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
    // 💰 NUEVOS CAMPOS
    costoHora: "",
    costoUnitario: "",
  });

  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [resultado, setResultado] = useState(null);

  const formatearFechaHora = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔹 Cargar historial desde API (fallback a localStorage)
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/oee/registros?limit=50");
        if (resp.ok && Array.isArray(resp.registros)) {
          setHistorial(resp.registros);
          localStorage.setItem("oee-historial", JSON.stringify(resp.registros));
          return;
        }
      } catch (err) {
        console.error(
          "❌ Error cargando OEE desde API, usando localStorage:",
          err
        );
      }

      const data = localStorage.getItem("oee-historial");
      if (data) setHistorial(JSON.parse(data));
    })();
  }, []);

  // 🔹 Manejo de cambios
  const handleChange = (e) => {
    setRegistro({ ...registro, [e.target.name]: e.target.value });
  };

  // 🔹 Calcular OEE + Impacto económico (en el front)
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
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const plan = parseFloat(tiempoPlanificado);
    const paradas = parseFloat(tiempoParadas || 0);
    const producidas = parseFloat(unidadesProducidas);
    const buenas = parseFloat(unidadesBuenas);
    const ideal = parseFloat(velocidadIdeal);

    const disponibilidad = ((plan - paradas) / plan) * 100;
    const rendimiento = (producidas / (plan * ideal)) * 100;
    const calidad = (buenas / producidas) * 100;
    const oee = (disponibilidad * rendimiento * calidad) / 10000;

    // ==========================================
    // 💰 Cálculo económico (mismo criterio backend)
    // ==========================================
    const costoHoraNum =
      costoHora !== undefined && costoHora !== null && costoHora !== ""
        ? Number(costoHora)
        : null;
    const costoUnitNum =
      costoUnitario !== undefined &&
      costoUnitario !== null &&
      costoUnitario !== ""
        ? Number(costoUnitario)
        : null;

    const tieneCostos =
      costoHoraNum !== null &&
      !Number.isNaN(costoHoraNum) &&
      costoHoraNum > 0 &&
      costoUnitNum !== null &&
      !Number.isNaN(costoUnitNum) &&
      costoUnitNum > 0;

    let costoParadas = 0;
    let costoScrap = 0;
    let costoBajoRendimiento = 0;
    let costoTotalPerdidas = 0;

    if (tieneCostos) {
      const tiempoOperativoMin = plan - paradas;
      const horasParada = paradas / 60;

      const unidadesMalas = Math.max(producidas - buenas, 0);
      const unidadesTeoricas = Math.max(tiempoOperativoMin * ideal, 0);
      const unidadesPerdidasRend = Math.max(
        unidadesTeoricas - producidas,
        0
      );

      costoParadas = Number((horasParada * costoHoraNum).toFixed(2));
      costoScrap = Number((unidadesMalas * costoUnitNum).toFixed(2));
      costoBajoRendimiento = Number(
        (unidadesPerdidasRend * costoUnitNum).toFixed(2)
      );
      costoTotalPerdidas = Number(
        (costoParadas + costoScrap + costoBajoRendimiento).toFixed(2)
      );
    }

    const nuevoRegistro = {
      ...registro,
      disponibilidad: disponibilidad.toFixed(2),
      rendimiento: rendimiento.toFixed(2),
      calidad: calidad.toFixed(2),
      oee: oee.toFixed(2),
      // 💰 guardamos también impacto económico en el estado
      costoParadas,
      costoScrap,
      costoBajoRendimiento,
      costoTotalPerdidas,
    };

    setResultado(nuevoRegistro);
  };

  // 🔹 Guardar registro (BD + localStorage)
  const guardarRegistro = async () => {
    if (!resultado) {
      alert("Primero calcula el OEE antes de guardar.");
      return;
    }

    try {
      // 1) Guardar en backend
      const payload = {
        fecha: resultado.fecha,
        linea: resultado.linea,
        turno: resultado.turno,
        tiempoPlanificado: resultado.tiempoPlanificado,
        tiempoParadas: resultado.tiempoParadas,
        unidadesProducidas: resultado.unidadesProducidas,
        unidadesBuenas: resultado.unidadesBuenas,
        velocidadIdeal: resultado.velocidadIdeal,
        observaciones: resultado.observaciones,
        // 💰 NUEVOS CAMPOS (opcionales, convertidos a número o null)
        costoHora: registro.costoHora ? Number(registro.costoHora) : null,
        costoUnitario: registro.costoUnitario
          ? Number(registro.costoUnitario)
          : null,
      };

      const resp = await apiPost("/oee/registros", payload);

      if (!resp.ok) {
        console.error("Error API OEE:", resp);
        alert("❌ Error guardando registro en el servidor");
      } else {
        const nuevo = resp.registro || resultado;

        // 2) Actualizar historial en memoria con lo que devuelve el backend
        const actualizado = [...historial, nuevo];
        setHistorial(actualizado);
        localStorage.setItem("oee-historial", JSON.stringify(actualizado));

        // 3) Refrescar bloque de resultado con lo del backend (por consistencia)
        setResultado((prev) => ({
          ...(prev || {}),
          costoParadas: nuevo.costoParadas ?? prev?.costoParadas ?? 0,
          costoScrap: nuevo.costoScrap ?? prev?.costoScrap ?? 0,
          costoBajoRendimiento:
            nuevo.costoBajoRendimiento ??
            prev?.costoBajoRendimiento ??
            0,
          costoTotalPerdidas:
            nuevo.costoTotalPerdidas ?? prev?.costoTotalPerdidas ?? 0,
        }));

        alert("Registro OEE guardado correctamente ✅");
      }
    } catch (err) {
      console.error("❌ Error guardando registro OEE:", err);
      alert("❌ Error guardando registro en el servidor");
    }
  };

  // 🔹 Limpiar formulario
  const limpiar = () => {
    setRegistro({
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
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        🧮 Registro Diario OEE
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">📅 Fecha</label>
            <input
              type="date"
              name="fecha"
              value={registro.fecha}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              🏭 Línea / Equipo
            </label>
            <input
              type="text"
              name="linea"
              value={registro.linea}
              onChange={handleChange}
              placeholder="Ej: Línea A1"
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">👷 Turno</label>
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

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              ⏱ Tiempo Planificado (min)
            </label>
            <input
              type="number"
              name="tiempoPlanificado"
              value={registro.tiempoPlanificado}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              🛑 Tiempo de Paradas (min)
            </label>
            <input
              type="number"
              name="tiempoParadas"
              value={registro.tiempoParadas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
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

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              📦 Unidades Producidas
            </label>
            <input
              type="number"
              name="unidadesProducidas"
              value={registro.unidadesProducidas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              ✅ Unidades Buenas
            </label>
            <input
              type="number"
              name="unidadesBuenas"
              value={registro.unidadesBuenas}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        </div>

        {/* 💰 Bloque de costos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              💸 Costo por hora de parada (CLP/h)
            </label>
            <input
              type="number"
              name="costoHora"
              value={registro.costoHora}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Ej: 60000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              🧮 Costo unitario del producto (CLP/unidad)
            </label>
            <input
              type="number"
              name="costoUnitario"
              value={registro.costoUnitario}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Ej: 500"
            />
          </div>
        </div>

        <label className="block text-sm text-gray-400 mb-1">
          📝 Observaciones
        </label>
        <textarea
          name="observaciones"
          value={registro.observaciones}
          onChange={handleChange}
          rows="2"
          className="w-full p-2 bg-gray-700 rounded mb-4"
          placeholder="Notas o incidencias del día..."
        />

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={calcularOEE}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Calcular OEE
          </button>
          <button
            onClick={guardarRegistro}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
          <button
            onClick={limpiar}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Limpiar
          </button>

          <button
            onClick={() => navigate("/oee/dashboard")}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            DashBoard
          </button>

          <button
            onClick={() => navigate("/oee/intro")}
            className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition"
          >
            Volver al Menú OEE
          </button>
        </div>
      </div>

      {/* 🔹 Resultado actual */}
      {resultado && (
        <div className="bg-gray-800 p-4 rounded-lg max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-xl font-bold mb-2 text-indigo-400">
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
                ${" "}
                {Number(resultado.costoParadas || 0).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">
                Costo por scrap / defectos:{" "}
              </span>
              <span className="font-semibold text-red-300">
                ${" "}
                {Number(resultado.costoScrap || 0).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">
                Costo por bajo rendimiento:{" "}
              </span>
              <span className="font-semibold text-red-300">
                $
                {Number(
                  resultado.costoBajoRendimiento || 0
                ).toLocaleString("es-CL")}
              </span>
            </p>
            <p>
              <span className="text-gray-300">
                💰 Costo total de pérdidas:{" "}
              </span>
              <span className="font-bold text-yellow-300">
                $
                {Number(
                  resultado.costoTotalPerdidas || 0
                ).toLocaleString("es-CL")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* 🔹 Historial rápido */}
      {historial.length > 0 && (
        <div className="max-w-5xl mx-auto bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-indigo-400 mb-3">
            📋 Últimos registros
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-700">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Línea</th>
                  <th className="px-3 py-2">Turno</th>
                  <th className="px-3 py-2">Disponibilidad (%)</th>
                  <th className="px-3 py-2">Rendimiento (%)</th>
                  <th className="px-3 py-2">Calidad (%)</th>
                  <th className="px-3 py-2">OEE (%)</th>
                </tr>
              </thead>
              <tbody>
                {historial
                  .slice(-5)
                  .reverse()
                  .map((h, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="px-3 py-1">
                        {formatearFechaHora(h.fecha)}
                      </td>
                      <td className="px-3 py-1">{h.linea}</td>
                      <td className="px-3 py-1">{h.turno}</td>
                      <td className="px-3 py-1">{h.disponibilidad}</td>
                      <td className="px-3 py-1">{h.rendimiento}</td>
                      <td className="px-3 py-1">{h.calidad}</td>
                      <td className="px-3 py-1 font-bold text-yellow-400">
                        {h.oee}
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
