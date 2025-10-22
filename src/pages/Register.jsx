// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoUsuario: "",
    telefono: "",
    correo: "",
    password: "",
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

  // 🔹 Validación avanzada de contraseña
  const validarPassword = (password) => {
    const minLength = /.{8,}/; // mínimo 8 caracteres
    const hasUppercase = /[A-Z]/; // al menos 1 mayúscula
    const hasLowercase = /[a-z]/; // al menos 1 minúscula
    const hasNumber = /[0-9].*[0-9]/; // al menos 2 números
    const hasSymbol = /[^A-Za-z0-9]/; // al menos 1 símbolo

    if (!minLength.test(password))
      return "La contraseña debe tener al menos 8 caracteres.";
    if (!hasUppercase.test(password))
      return "Debe incluir al menos una letra mayúscula.";
    if (!hasLowercase.test(password))
      return "Debe incluir al menos una letra minúscula.";
    if (!hasNumber.test(password))
      return "Debe incluir al menos dos números.";
    if (!hasSymbol.test(password))
      return "Debe incluir al menos un carácter especial (#, $, %, etc.).";

    return null; // ✅ válida
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

    const passwordError = validarPassword(formData.password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    // Guardar usuario en localStorage
    const users = JSON.parse(localStorage.getItem("usuarios")) || [];
    const exists = users.find((u) => u.correo === formData.correo);

    if (exists) {
      alert("El correo ya está registrado");
      return;
    }

    users.push(formData);
    localStorage.setItem("usuarios", JSON.stringify(users));

    alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
    navigate("/login");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-lg mt-8 text-white">
      <div className="flex flex-col items-center mb-6">
        <img
          src={logoprincipal}
          alt="Logo Mentor"
          className="h-20 w-auto mb-2 brightness-200 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-indigo-400">
        Registro de Usuario
      </h1>

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

        <div>
          <label className="block mb-1">Teléfono (con código de país):</label>
          <PhoneInput
            country={"cl"}
            value={formData.telefono}
            onChange={(phone) => setFormData({ ...formData, telefono: phone })}
            inputStyle={{
              width: "100%",
              backgroundColor: "#374151",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "15px",
            }}
            buttonStyle={{
              backgroundColor: "#1f2937",
              border: "none",
            }}
            dropdownStyle={{
              backgroundColor: "#1f2937",
              color: "white",
            }}
          />
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

        {/* 🔒 Contraseña con validación fuerte */}
        <div>
          <label className="block mb-1">Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            placeholder="Debe incluir letras, números y símbolos"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            La contraseña debe tener:
            al menos 8 caracteres.
            2 números.
            un símbolo.
            una mayúscula.
            una minúscula.
          </p>
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


