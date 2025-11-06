// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    empresa: "",
  });
  const [error, setError] = useState("");

  // 🧭 Si ya hay sesión activa, redirige automáticamente
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const rol = user.rol?.toLowerCase().replace(/\s+/g, "");

      if (rol === "superadmin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (rol === "adminempresa") {
        navigate("/inicio", { replace: true });
      } else {
        navigate("/inicio", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("🧠 Datos del usuario recibido:", data.usuario);

      if (response.ok) {
        // ✅ Guardar sesión
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.usuario));

        // ✅ Normalizar rol
        const rol = data.usuario.rol?.toLowerCase().replace(/\s+/g, "");

        // ✅ Redirigir según rol
        if (rol === "superadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (rol === "adminempresa") {
          navigate("/inicio", { replace: true });
        } else {
          navigate("/inicio", { replace: true });
        }
      } else {
        setError(data.message || "Error de autenticación");
      }
    } catch (err) {
      console.error("Error al conectar:", err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoprincipal}
            alt="Logo MentorSuites"
            className="h-20 w-auto mb-2 brightness-200 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h2 className="text-3xl font-bold text-indigo-400">Iniciar sesión</h2>
          <p className="text-gray-400 text-sm">Bienvenido a MentorSuites</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="ejemplo@correo.com"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            required
          />
          <select
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Selecciona empresa...</option>
            <option value="MentorSuites HQ">MentorSuites HQ</option>
            <option value="Empresa 1">Empresa 1</option>
          </select>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition duration-300"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}




