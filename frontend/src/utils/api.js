// src/utils/api.js

// 🧩 Detectar entorno automáticamente
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// 🔗 URL BASE del backend (ajusta el dominio según tu despliegue)
const PROD_API_BASE = "https://mentor-six-sigma-api.vercel.app/api"; // ⚙️ cámbialo si tu backend tiene otro dominio

export const API_BASE = isLocalhost
  ? "http://localhost:5000/api" // 💻 Desarrollo local
  : PROD_API_BASE;              // 🌐 Producción (Vercel)

// 🧠 Log (solo una vez)
if (!window._loggedApiBase) {
  console.log("🌍 API_BASE actual:", API_BASE);
  window._loggedApiBase = true;
}

// ---------------------------------------------------------------------------
// 🔧 Helpers genéricos
// ---------------------------------------------------------------------------

export const getHeaders = (auth = true) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

// ---------------------------------------------------------------------------
// 🚀 Métodos API con fetch (optimizado)
// ---------------------------------------------------------------------------

export const apiGet = async (url, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, { headers });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.json();
};

export const apiPost = async (url, body, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status} ${res.statusText}`);
  return res.json();
};

export const apiPatch = async (url, body, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} → ${res.status} ${res.statusText}`);
  return res.json();
};

export const apiDelete = async (url, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status} ${res.statusText}`);
  return res.json();
};
