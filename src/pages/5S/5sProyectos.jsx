import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FiveSProyectos() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("user"))?.email || "anonimo";

  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    area: "",
    responsable: "",
    fechaInicio: "",
  });

  // Cargar proyectos guardados
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(`proyectos5s-${usuario}`)) || [];
    setProyectos(data);
  }, [usuario]);

  // Guardar proyectos en localStorage
  useEffect(() => {
    localStorage.setItem(`proyectos5s-${usuario}`, JSON.stringify(proyectos));
  }, [proyectos, usuario]);

  const crearProyecto = (e) => {
    e.preventDefault();
    if (!nuevoProyecto.nombre || !nuevoProyecto.area) {
      alert("Por favor completa al menos el nombre y el área del proyecto.");
      return;
    }
    const nuevo = {
      id: Date.now(),
      ...nuevoProyecto,
      estado: "En progreso",
      avance: 0,
      fechaCreacion: new Date().toLocaleDateString(),
    };
    setProyectos([...proyectos, nuevo]);
    setNuevoProyecto({ nombre: "", area: "", responsable: "", fechaInicio: "" });
  };

  const eliminarProyecto = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      setProyectos(proyectos.filter((p) => p.id !== id));
    }
  };

  const abrirProyecto = (id, ruta) => {
    navigate(`/5s/${id}/${ruta}`);
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

      {/* Formulario para crear proyecto */}
      <form
        onSubmit={crearProyecto}
        className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700"
      >
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">Nuevo Proyecto</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={nuevoProyecto.nombre}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
            className="bg-gray-700 p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Área"
            value={nuevoProyecto.area}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, area: e.target.value })}
            className="bg-gray-700 p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Responsable"
            value={nuevoProyecto.responsable}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, responsable: e.target.value })}
            className="bg-gray-700 p-2 rounded w-full"
          />
          <input
            type="date"
            value={nuevoProyecto.fechaInicio}
            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, fechaInicio: e.target.value })}
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

      {/* Lista de proyectos */}
      {proyectos.length === 0 ? (
        <p className="text-gray-400 text-center">No hay proyectos creados aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700"
            >
              <h3 className="text-2xl font-semibold text-indigo-300 mb-2">{p.nombre}</h3>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Área:</strong> {p.area}
              </p>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Responsable:</strong> {p.responsable || "—"}
              </p>
              <p className="text-gray-400 text-sm mb-3">
                <strong>Inicio:</strong> {p.fechaInicio || "—"}
              </p>

              {/* Botones de navegación */}
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
