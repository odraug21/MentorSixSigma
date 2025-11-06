// src/pages/Admin/Empresas.jsx
import React, { useState, useEffect } from "react";

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState({ nombre: "", rut: "", pais: "" });
  const token = localStorage.getItem("token");

  // 🧠 Cargar empresas
  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/empresas", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ TOKEN agregado
        },
      });

      if (!res.ok) {
        const errMsg = await res.text();
        console.warn("⚠️ Error cargando empresas:", res.status, errMsg);
        alert(`⚠️ Error al obtener empresas: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.log("🏢 Empresas cargadas:", data);

      if (Array.isArray(data)) {
        setEmpresas(data);
      } else {
        setEmpresas([]);
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
    }
  };

  // 🧱 Crear empresa
  const crearEmpresa = async () => {
    if (!form.nombre || !form.rut || !form.pais) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ TOKEN agregado
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("📦 Respuesta backend:", data);

      if (res.ok) {
        alert("✅ Empresa creada correctamente");
        setEmpresas((prev) => [...prev, data.empresa || form]);
        resetForm();
      } else {
        alert(`⚠️ Error al crear la empresa: ${data.message || "Error en el servidor"}`);
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      alert("Error de conexión con el servidor");
    }
  };

// 🗑️ Eliminar empresa
const eliminarEmpresa = async (id) => {
  const confirmar = window.confirm("¿Seguro que deseas eliminar esta empresa?");
  if (!confirmar) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/empresas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      // Actualiza el estado para eliminarla del frontend
      setEmpresas((prev) => prev.filter((e) => e.id !== id));
      alert("🗑️ Empresa eliminada correctamente");
    } else {
      alert(`⚠️ ${data.message || "Error al eliminar empresa"}`);
    }
  } catch (err) {
    console.error("❌ Error eliminando empresa:", err);
    alert("Error de conexión con el servidor");
  }
};



  // ✏️ Manejo de inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔄 Reset formulario
  const resetForm = () => {
    setForm({ nombre: "", rut: "", pais: "" });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">
        Gestión de Empresas
      </h2>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la empresa"
          value={form.nombre}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
        <input
          type="text"
          name="rut"
          placeholder="RUT o identificación"
          value={form.rut}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
        <input
          type="text"
          name="pais"
          placeholder="País"
          value={form.pais}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
      </div>

      <button
        onClick={crearEmpresa}
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold mb-8"
      >
        Crear Empresa
      </button>

      {/* Tabla */}
      <table className="w-full bg-gray-800 rounded-lg shadow-md">
        <thead className="bg-gray-700 text-indigo-300">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">RUT</th>
            <th className="py-2 px-4 text-left">País</th>
            <th className="py-2 px-4 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr
              key={e.id}
              className="border-t border-gray-700 hover:bg-gray-700/50"
            >
              <td className="py-2 px-4">{e.id}</td>
              <td className="py-2 px-4">{e.nombre}</td>
              <td className="py-2 px-4">{e.rut}</td>
              <td className="py-2 px-4">{e.pais}</td>
              <td className="py-2 px-4 flex justify-center">
                <button
                onClick={() => eliminarEmpresa(e.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                 >
                  Eliminar
            </button>

              </td>

            </tr>
          ))}



        </tbody>
      </table>
    </div>
  );
}

