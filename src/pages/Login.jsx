// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

const handleSubmit = (e) => {
  e.preventDefault();
  // Simular login exitoso
  alert("Bienvenido!");
  navigate("/inicio"); // 👈 redirige al dashboard
};


    // Simulación de autenticación
    if (email === "admin@mentor.com" && password === "1234") {
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/dashboard"); // o la página principal del usuario
    } else {
      setError("Credenciales incorrectas. Intenta nuevamente.");
    }
  };

  return (

    
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoprincipal}
            alt="Logo Mentor"
            className="h-20 w-auto mb-2 brightness-200"
            onClick={() => navigate("/")}
          />
          <h2 className="text-3xl font-bold text-indigo-400">Iniciar sesión</h2>
          <p className="text-gray-400 text-sm">Bienvenido a A3 Mentor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition duration-300"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-indigo-400 hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
