// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

