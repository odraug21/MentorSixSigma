// src/utils/api.js

// 🌐 URL del backend en Render
const PROD_API_BASE = "https://mentorsuites-backend.onrender.com/api";

// 🚀 Forzar siempre el backend Render (porque tu backend local no está corriendo)
export const API_BASE = PROD_API_BASE;

if (!window._loggedApiBase) {
  console.log("🌍 API_BASE forzado:", API_BASE);
  window._loggedApiBase = true;
}

// ----------------------------------------------
// 🔧 Helpers
// ----------------------------------------------
export const getHeaders = (auth = true) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

// ----------------------------------------------
// 🚀 Métodos API
// ----------------------------------------------
export const apiGet = async (url, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, { headers });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
};

export const apiPost = async (url, body, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}`);
  return res.json();
};

export const apiPatch = async (url, body, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} → ${res.status}`);
  return res.json();
};

export const apiDelete = async (url, auth = true) => {
  const { headers } = getHeaders(auth);
  const res = await fetch(`${API_BASE}${url}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return res.json();
};
