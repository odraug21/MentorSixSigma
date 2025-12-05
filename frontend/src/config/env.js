// src/config/env.js

// Detecta CRA (Create React App)
const craEnv = (typeof process !== "undefined" && process.env) || {};

// ¿Estamos en producción?
const isProd = (craEnv.NODE_ENV || "").toLowerCase() === "production";

// URL fija para producción (Render)
const PROD_API = "https://mentorsuites-backend.onrender.com";

function pickBaseUrl() {
  // 1️⃣ PRIORIDAD MÁXIMA → Variable CRA
  if (craEnv.REACT_APP_API_BASE) {
    return craEnv.REACT_APP_API_BASE.replace(/\/+$/, "");
  }

  // 2️⃣ PRODUCCIÓN (si no existe variable)
  if (isProd) {
    return PROD_API;
  }

  // 3️⃣ DESARROLLO LOCAL
  return "http://localhost:5000";
}

// URL final normalizada
export const API_BASE = pickBaseUrl();
console.log("🌐 API_BASE:", API_BASE);
