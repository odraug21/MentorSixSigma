// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/env";

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const requiredRoles = roles || allowedRoles;

  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const verificarAcceso = async () => {
      // Si no hay token, bloquear
      if (!token) {
        if (!cancelled) setIsAllowed(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/roles-modulos/permitidos/usuario`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!cancelled) {
          // Si responde 200, permitir
          if (res.status === 200) setIsAllowed(true);
          else setIsAllowed(false);
        }
      } catch (err) {
        if (cancelled) return;

        const status = err?.response?.status;
        console.warn("⚠️ Error verificando acceso:", status, err?.message);

        // ⚙️ Si el backend responde 404, consideramos permitido (para evitar loops)
        if (status === 404) {
          if (!cancelled) setIsAllowed(true);
          return;
        }

        // ⚙️ Si el token es inválido o expiró → limpiar sesión y forzar login
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (!cancelled) setIsAllowed(false);
          return;
        }

        // Otros errores → permitir temporalmente
        if (!cancelled) setIsAllowed(true);
      }
    };

    verificarAcceso();
    return () => { cancelled = true; };
  }, [token]);

  // Mientras verifica
  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        Verificando acceso...
      </div>
    );
  }

  // Sin acceso o sin token
  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Validación adicional por rol (solo si hay roles definidos)
  if (requiredRoles && user?.rol && !requiredRoles.includes(user.rol)) {
    return <Navigate to="/inicio" replace />;
  }

  // Todo bien → renderiza la página protegida
  return children;
}
