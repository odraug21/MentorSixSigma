// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";
import { API_BASE } from "../utils/api"; // ✅ Fuente centralizada

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    empresa: "",
  });
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState("");

  // 🔄 Actualizar inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔍 Buscar empresas asociadas al email
  const buscarEmpresas = async () => {
    if (!formData.email) return;
    try {
      const res = await fetch(`${API_BASE}/usuarios/empresas/${encodeURIComponent(formData.email)}`);


      if (!res.ok) {
        console.error("❌ Error al obtener empresas:", res.statusText);
        setEmpresas([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) setEmpresas(data);
      else setEmpresas([]);
    } catch (err) {
      console.error("❌ Error cargando empresas:", err);
      setEmpresas([]);
    }
  };

  // 🧠 Enviar formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.usuario));

        const rol = data.usuario.rol?.toLowerCase().replace(/\s+/g, "");
        if (rol === "superadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/inicio", { replace: true });
        }
      } else {
        setError(data.message || "Error de autenticación");
      }
    } catch (err) {
      console.error("❌ Error al conectar:", err);
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
          {/* Email */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={buscarEmpresas}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="ejemplo@correo.com"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
            required
          />

          {/* Empresa */}
          <select
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Selecciona empresa...</option>
            {Array.isArray(empresas) && empresas.length > 0 ? (
              empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {empresas && empresas.message
                  ? "Error al cargar"
                  : "Sin empresas asociadas"}
              </option>
            )}
          </select>

          {/* Error */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Botón */}
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
