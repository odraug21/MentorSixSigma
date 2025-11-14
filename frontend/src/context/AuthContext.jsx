import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Cargar sesión desde localStorage al iniciar
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      console.error("⚠️ Error parsing stored user, limpiando localStorage");
      localStorage.removeItem("user");
    }
  }
}, []);


  // Simulación de login (para pruebas sin backend)
const login = async ({ email, password, empresa }) => {
  try {
    // 🔹 Intenta login real con backend
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, empresa }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // 🟢 Login exitoso desde el backend
      setUser(data.usuario);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      navigate("/inicio");
      return { success: true };
    }

    // ⚠️ Si el backend falla, mostrar mensaje
    return { success: false, message: data.message || "Error de autenticación" };
  } catch (err) {
    console.error("Error conectando al backend:", err);

    // 🔸 Fallback local si el servidor está caído
    const fakeUsers = [
      {
        email: "super@mentor.com",
        password: "1234",
        nombre: "SuperAdmin MentorSuites",
        rol: "SuperAdmin",
        empresa: "MentorSuites HQ",
      },
      {
        email: "admin@empresa1.com",
        password: "1234",
        nombre: "Administrador Empresa 1",
        rol: "AdminEmpresa",
        empresa: "Empresa 1",
      },
    ];

    const found = fakeUsers.find(
      (u) =>
        u.email === email && u.password === password && u.empresa === empresa
    );

    if (found) {
      setUser(found);
      localStorage.setItem("user", JSON.stringify(found));
      navigate("/inicio");
      return { success: true, message: "Modo local (sin backend)" };
    } else {
      return { success: false, message: "Error de conexión con el servidor" };
    }
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
