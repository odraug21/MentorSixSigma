// src/config/env.js

// Detecta Vite o CRA
const viteEnv = (typeof import.meta !== "undefined" && import.meta.env) || {};
const craEnv = (typeof process !== "undefined" && process.env) || {};

// ¿Estamos en producción?
const isProd =
  (viteEnv.MODE || craEnv.NODE_ENV || "").toLowerCase() === "production";

// Permite varias claves comunes y normaliza
function pickBaseUrl() {
  const candidates = [
    viteEnv.VITE_API_BASE,        // 👈 PRODUCCIÓN EN VERCEL USARÁ ESTA
    viteEnv.VITE_API_URL,
    craEnv.REACT_APP_API_BASE,
    craEnv.REACT_APP_API_URL,
  ].filter(Boolean);

  let base = candidates[0];

  // Si no existe ninguna URL definida:
  if (!base) {
    if (typeof window !== "undefined") {
      if (isProd) {
        console.error("❌ ERROR: No se definió VITE_API_BASE en PRODUCCIÓN.");
        // fallback: no usar origin, porque ahí NO existe backend
        base = "";
      } else {
        base = `${window.location.protocol}//${window.location.hostname}:5000`;
      }
    } else {
      base = "http://localhost:5000";
    }
  }

  // Normaliza URL
  try {
    const u = new URL(base);
    if (u.pathname.endsWith("/api")) {
      u.pathname = u.pathname.replace(/\/api\/?$/, "");
    }
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString();
  } catch {
    return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
}

// Export final
export const API_BASE = pickBaseUrl().replace(/\/+$/, "");
console.log("🌐 API_BASE:", API_BASE);
