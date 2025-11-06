// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  let user = null;
  let token = null;

  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }

    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      token = storedToken;
    }
  } catch (error) {
    console.warn("⚠️ Error al parsear datos de sesión:", error);
    localStorage.clear();
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

