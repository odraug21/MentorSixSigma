// src/components/ProtectedModule.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedModule({ children, ruta }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const modulos = user.modulos || [];

  const modulo = modulos.find((m) => m.ruta === ruta);

  if (!modulo || !modulo.permiso_lectura) {
    console.warn(`⛔ Acceso bloqueado a módulo: ${ruta}`);
    return <Navigate to="/inicio" replace />;
  }

  return children;
}
