// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ============================================================
 *  🔐 ProtectedRoute (Optimizado)
 * ============================================================
 * - No hace llamadas al backend
 * - Valida token y usuario desde LocalStorage
 * - Valida roles si la ruta lo requiere
 * - Ultra rápido (sin pantalla "verificando acceso")
 * ============================================================
 */

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const location = useLocation();
  const { user } = useAuth();

  // 🔹 Token almacenado
  const token = localStorage.getItem("token");

  // 🔹 Roles opcionales permitidos por la ruta
  const requiredRoles = roles || allowedRoles;

  /* ============================================================
     🛑 1. Si NO hay token → redirigir al login
     ============================================================ */
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  /* ============================================================
     🛡️ 2. Si la ruta requiere roles → validarlos localmente
     ============================================================ */
  if (requiredRoles && !requiredRoles.includes(user.rol)) {
    console.warn(
      `⛔ Acceso denegado: Rol "${user.rol}" no permitido en esta ruta`
    );
    return <Navigate to="/inicio" replace />;
  }

  /* ============================================================
     ✅ Todo OK → renderiza el contenido protegido
     ============================================================ */
  return children;
}
