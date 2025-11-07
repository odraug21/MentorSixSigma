// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children, roles }) {
  const [isAllowed, setIsAllowed] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/roles-modulos/permitidos/usuario", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ si el backend responde correctamente
        if (res.status === 200) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error("❌ Error verificando acceso:", error);
        setIsAllowed(false);
      }
    };

    if (token) verificarAcceso();
    else setIsAllowed(false);
  }, [token]);

  // ⏳ mientras se verifica, no renderiza nada (evita saltos visuales)
  if (isAllowed === null) {
    return <div className="text-center text-white mt-10">Verificando acceso...</div>;
  }

  // ❌ sin acceso → redirigir al login
  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  // ✅ acceso permitido → mostrar el contenido
  return children;
}
