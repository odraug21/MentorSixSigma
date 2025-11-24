// src/pages/5S/5sProyectos.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../../utils/api";

const mapProyecto = (row) => ({
  id: row.id,
  nombre: row.nombre,
  area: row.area,
  responsable: row.responsable,
  fechaInicio: row.fecha_inicio,
  estado: row.estado,
  avance: row.avance,
  fechaCreacion: row.fecha_creacion,
  empresaNombre: row.empresa_nombre || "",
});

export default function FiveSProyectos() {
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    area: "",
    responsable: "",
    fechaInicio: "",
  });

  // 🔹 Cargar proyectos desde backend
  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await apiGet("/5s/proyectos", true);
        setProyectos(data.map(mapProyecto));
      } catch (error) {
        console.error("❌ Error cargando proyectos 5S:", error);
        setMensaje("Error cargando proyectos 5S");
      } finally {
        setLoading(false);
      }
    };
    cargarProyectos();
  }, []);

  // 🔹 Crear proyecto nuevo
const crearProyecto = async (e) => {
  e.preventDefault();
  setMensaje("");

  if (!nuevoProyecto.nombre || !nuevoProyecto.area) {
    alert("Por favor completa al menos el nombre y el área del proyecto.");
    return;
  }

  try {
    const creado = await apiPost(
      "/5s/proyectos",
      {
        nombre: nuevoProyecto.nombre,
        area: nuevoProyecto.area,
        responsable: nuevoProyecto.responsable,
        fechaInicio: nuevoProyecto.fechaInicio || null
        // ❌ YA NO enviamos id_empresa
      },
      true
    );

    setProyectos((prev) => [mapProyecto(creado), ...prev]);

    setNuevoProyecto({
      nombre: "",
      area: "",
      responsable: "",
      fechaInicio: ""
    });

    setMensaje("✅ Proyecto creado correctamente");
  } catch (error) {
    console.error("❌ Error creando proyecto 5S:", error);
    setMensaje("Error creando proyecto 5S");
  }
};

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Eliminar este proyecto?")) return;

    try {
      await apiDelete(`/5s/proyectos/${id}`, true);
      setProyectos((prev) => prev.filter((p) => p.id !== id));
      setMensaje("🗑️ Proyecto eliminado");
    } catch (error) {
      console.error("❌ Error eliminando proyecto 5S:", error);
      setMensaje("Error eliminando proyecto 5S");
    }
  };

  const abrirProyecto = (id, ruta) => {
    navigate(`/5s/${ruta}/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-400">Gestión de Proyectos 5S</h1>
        <button
          onClick={() => navigate("/5s/intro")}
          className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold"
        >
          Volver al menú 5S
        </button>
      </div>

      {mensaje && (
        <div className="mb-4 bg-gray-800 border border-gray-600 px-4 py-2 rounded">
          {mensaje}
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={crearProyecto}
        className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700"
      >
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          Nuevo Proyecto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={nuevoProyecto.nombre}
            onChange={(e) =>
              setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })
            }
            className="bg-gray-700 p-2 rounded w-full"
          />

          <input
            type="text"
            placeholder="Área"
            value={nuevoProyecto.area}
            onChange={(e) =>
              setNuevoProyecto({ ...nuevoProyecto, area: e.target.value })
            }
            className="bg-gray-700 p-2 rounded w-full"
          />

          <input
            type="text"
            placeholder="Responsable"
            value={nuevoProyecto.responsable}
            onChange={(e) =>
              setNuevoProyecto({ ...nuevoProyecto, responsable: e.target.value })
            }
            className="bg-gray-700 p-2 rounded w-full"
          />

          <input
            type="date"
            value={nuevoProyecto.fechaInicio}
            onChange={(e) =>
              setNuevoProyecto({ ...nuevoProyecto, fechaInicio: e.target.value })
            }
            className="bg-gray-700 p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-700 font-semibold"
        >
          Crear Proyecto
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-center">Cargando proyectos…</p>
      ) : proyectos.length === 0 ? (
        <p className="text-gray-400 text-center">
          No hay proyectos creados aún.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700"
            >
              <h3 className="text-2xl font-semibold text-indigo-300 mb-2">
                {p.nombre}
              </h3>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Área:</strong> {p.area}
              </p>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Responsable:</strong> {p.responsable || "—"}
              </p>
              <p className="text-gray-400 text-sm mb-1">
                <strong>Inicio:</strong> {p.fechaInicio || "—"}
              </p>
              {p.empresaNombre && (
                <p className="text-gray-500 text-xs mb-2">
                  <strong>Empresa:</strong> {p.empresaNombre}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => abrirProyecto(p.id, "implementacion")}
                  className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Implementación
                </button>

                <button
                  onClick={() => abrirProyecto(p.id, "seguimiento")}
                  className="bg-yellow-600 px-3 py-2 rounded hover:bg-yellow-700 text-sm text-black"
                >
                  Seguimiento
                </button>

                <button
                  onClick={() => abrirProyecto(p.id, "auditoria")}
                  className="bg-purple-600 px-3 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  Auditoría
                </button>

                <button
                  onClick={() => eliminarProyecto(p.id)}
                  className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
