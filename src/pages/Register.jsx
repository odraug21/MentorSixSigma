// src/pages/Register.jsx
import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoUsuario: "",
    telefonoIndicativo: "+56",
    telefono: "",
    correo: "",
    nivelAcademico: "",
    aceptaTerminos: false,
    captcha: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }
    if (!formData.captcha) {
      alert("Debes validar el captcha");
      return;
    }
    console.log("Formulario enviado:", formData);
    alert("Registro exitoso");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-lg mt-8 text-white">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Registro de Usuario</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Apellido:</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Tipo de usuario:</label>
          <select
            name="tipoUsuario"
            value={formData.tipoUsuario}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          >
            <option value="">Selecciona...</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Empresa">Empresa</option>
            <option value="Consultor">Consultor</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block mb-1">Indicativo:</label>
            <input
              type="text"
              name="telefonoIndicativo"
              value={formData.telefonoIndicativo}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700"
              required
            />
          </div>
          <div className="flex-2">
            <label className="block mb-1">Número de teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700"
              required
            />
          </div>
        </div>
        <div>
          <label className="block mb-1">Correo electrónico:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Nivel académico:</label>
          <input
            type="text"
            name="nivelAcademico"
            value={formData.nivelAcademico}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="aceptaTerminos"
            checked={formData.aceptaTerminos}
            onChange={handleChange}
          />
          <label>Acepto los términos y condiciones</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="captcha"
            checked={formData.captcha}
            onChange={handleChange}
          />
          <label>No soy un robot</label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-500 py-2 rounded hover:bg-indigo-600 mt-4"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Register;
