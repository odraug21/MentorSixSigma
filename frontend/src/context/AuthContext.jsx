// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresaId");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setUsuario({
          id: decoded.id,
          email: decoded.email,
          rol: decoded.rol,
          empresa_id: decoded.empresa_id ?? Number(empresaId) ?? null,
        });
      } catch (err) {
        console.error("❌ Error decodificando token:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("empresaId");
        setUsuario(null);
      }
    }

    setCargando(false);
  }, []);

  const login = (usuarioData, token, empresaId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("empresaId", empresaId);

    setUsuario({
      id: usuarioData.id,
      email: usuarioData.email,
      rol: usuarioData.rol,
      empresa_id: empresaId,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresaId");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
