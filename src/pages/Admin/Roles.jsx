// src/pages/Admin/Roles.jsx
import React, { useState } from "react";

export default function Roles() {
  const [roles, setRoles] = useState([
    { id: 1, nombre: "SuperAdmin", descripcion: "Acceso total a todo el sistema", permisos: ["Empresas", "Usuarios", "Roles", "Todos los módulos"] },
    { id: 2, nombre: "AdminEmpresa", descripcion: "Administra su empresa y usuarios asociados", permisos: ["Usuarios", "Reportes", "A3", "5S"] },
    { id: 3, nombre: "Usuario", descripcion: "Accede a módulos operativos asignados", permisos: ["A3", "5S", "Gemba Walk"] },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6">
        Gestión de Roles
      </h1>
      <p className="text-gray-400 mb-10">
        Define los permisos de acceso a los distintos módulos del sistema.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-indigo-300">
            <tr>
              <th className="py-3 px-4 text-left">Rol</th>
              <th className="py-3 px-4 text-left">Descripción</th>
              <th className="py-3 px-4 text-left">Permisos</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="py-3 px-4 font-semibold text-indigo-400">{rol.nombre}</td>
                <td className="py-3 px-4 text-gray-300">{rol.descripcion}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {rol.permisos.map((permiso, i) => (
                      <span
                        key={i}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {permiso}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
        onClick={() => alert("Función para agregar nuevos roles próximamente.")}
      >
        ➕ Agregar nuevo rol
      </button>
    </div>
  );
}

