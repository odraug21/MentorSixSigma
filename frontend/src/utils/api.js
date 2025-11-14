// src/utils/api.js

// 🧩 Detectar entorno automáticamente
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// 🔗 URL BASE del backend
export const API_BASE = isLocalhost
  ? "http://localhost:5000/api"    // 💻 Desarrollo local
  : "/api";                         // 🌐 Producción en Vercel

// 🧠 Log (solo 1 vez)
if (!window._loggedApiBase) {
  console.log("🌍 API_BASE actual:", API_BASE);
  window._loggedApiBase = true;
}

// ---------------------------------------------------------------------------
// 🔧 Helpers genéricos
// ---------------------------------------------------------------------------

export const getHeaders = (auth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

// ---------------------------------------------------------------------------
// 🚀 Métodos API con fetch
// ---------------------------------------------------------------------------

export const apiGet = async (url, auth = true) => {
  const res = await fetch(`${API_BASE}${url}`, getHeaders(auth));
  return res.json();
};

export const apiPost = async (url, body, auth = true) => {
  const res = await fetch(`${API_BASE}${url}`, {
    ...getHeaders(auth),
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
};

export const apiPatch = async (url, body, auth = true) => {
  const res = await fetch(`${API_BASE}${url}`, {
    ...getHeaders(auth),
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.json();
};

export const apiDelete = async (url, auth = true) => {
  const res = await fetch(`${API_BASE}${url}`, {
    ...getHeaders(auth),
    method: "DELETE",
  });
  return res.json();
};
