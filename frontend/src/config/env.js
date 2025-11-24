// src/config/env.js

// Detecta Vite o CRA
const viteEnv = (typeof import.meta !== "undefined" && import.meta.env) || {};
const craEnv = (typeof process !== "undefined" && process.env) || {};

// Permite varias claves comunes y normaliza
function pickBaseUrl() {
  const candidates = [
    viteEnv.VITE_API_BASE,
    viteEnv.VITE_API_URL,         // por compatibilidad
    craEnv.REACT_APP_API_BASE,
    craEnv.REACT_APP_API_URL,     // por compatibilidad
  ].filter(Boolean);

  let base = candidates[0];

  // Fallback razonable si no está definida
  if (!base) {
    base = `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  // Normaliza: sin /api final y sin / extra
  try {
    const u = new URL(base);
    // Si alguien puso /api al final, lo removemos (nuestro client ya concatena /api/...)
    if (u.pathname.endsWith("/api")) {
      u.pathname = u.pathname.replace(/\/api\/?$/, "");
    }
    // Elimina slash final
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString();
  } catch {
    return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
}

export const API_BASE = pickBaseUrl().replace(/\/+$/, "");


