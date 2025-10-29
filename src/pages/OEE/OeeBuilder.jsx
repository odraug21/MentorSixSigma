import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  });
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [resultado, setResultado] = useState(null);

  // 🔹 Cargar historial al iniciar
  useEffect(() => {
    const data = localStorage.getItem("oee-historial");
    if (data) setHistorial(JSON.parse(data));
  }, []);

  // 🔹 Manejo de cambios
  const handleChange = (e) => {
    setRegistro({ ...registro, [e.target.name]: e.target.value });
  };

  // 🔹 Calcular OEE
  const calcularOEE = () => {
    const {
      tiempoPlanificado,
      tiempoParadas,
      unidadesProducidas,
      unidadesBuenas,
      velocidadIdeal,
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

    const nuevoRegistro = {
      ...registro,
      disponibilidad: disponibilidad.toFixed(2),
      rendimiento: rendimiento.toFixed(2),
      calidad: calidad.toFixed(2),
      oee: oee.toFixed(2),
    };

    setResultado(nuevoRegistro);
  };

  // 🔹 Guardar registro
  const guardarRegistro = () => {
    if (!resultado) {
      alert("Primero calcula el OEE antes de guardar.");
      return;
    }

    const actualizado = [...historial, resultado];
    setHistorial(actualizado);
    localStorage.setItem("oee-historial", JSON.stringify(actualizado));
    alert("Registro OEE guardado correctamente ✅");
    setResultado(null);
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
            <label className="block text-sm text-gray-400 mb-1">🏭 Línea / Equipo</label>
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

        <label className="block text-sm text-gray-400 mb-1">📝 Observaciones</label>
        <textarea
          name="observaciones"
          value={registro.observaciones}
          onChange={handleChange}
          rows="2"
          className="w-full p-2 bg-gray-700 rounded mb-4"
          placeholder="Notas o incidencias del día..."
        />

        <div className="flex gap-3 justify-center">
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
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Volver al Menú OEE
          </button>



        </div>
      </div>

      {/* 🔹 Resultado actual */}
      {resultado && (
        <div className="bg-gray-800 p-4 rounded-lg max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-xl font-bold mb-2 text-indigo-400">Resultado del Día</h2>
          <p>Disponibilidad: {resultado.disponibilidad}%</p>
          <p>Rendimiento: {resultado.rendimiento}%</p>
          <p>Calidad: {resultado.calidad}%</p>
          <p className="text-yellow-400 font-bold mt-2 text-lg">
            OEE: {resultado.oee}%
          </p>
        </div>
      )}

      {/* 🔹 Historial rápido */}
      {historial.length > 0 && (
        <div className="max-w-5xl mx-auto bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-indigo-400 mb-3">📋 Últimos registros</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-700">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Línea</th>
                  <th className="px-3 py-2">Turno</th>
                  <th className="px-3 py-2">Disp (%)</th>
                  <th className="px-3 py-2">Rend (%)</th>
                  <th className="px-3 py-2">Calid (%)</th>
                  <th className="px-3 py-2">OEE (%)</th>
                </tr>
              </thead>
              <tbody>
                {historial
                  .slice(-5)
                  .reverse()
                  .map((h, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="px-3 py-1">{h.fecha}</td>
                      <td className="px-3 py-1">{h.linea}</td>
                      <td className="px-3 py-1">{h.turno}</td>
                      <td className="px-3 py-1">{h.disponibilidad}</td>
                      <td className="px-3 py-1">{h.rendimiento}</td>
                      <td className="px-3 py-1">{h.calidad}</td>
                      <td className="px-3 py-1 font-bold text-yellow-400">{h.oee}</td>
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
