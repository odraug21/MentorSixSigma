// src/utils/api.js

// ============================================
// 🌐 Cliente API central (Axios)
// ============================================
import axios from "axios";
import { API_BASE } from "../config/env";

// 👇 Todas las rutas del backend usan /api
const BASE_URL = `${API_BASE}/api`;

if (!window._loggedApiBase) {
  console.log("🌍 API_BASE:", API_BASE);
  console.log("📡 BASE_URL API:", BASE_URL);
  window._loggedApiBase = true;
}

// --------------------------------------------
// 🔑 Helpers de headers
// --------------------------------------------
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// --------------------------------------------
// 🚀 Métodos JSON (GET / POST / PATCH / PUT / DELETE)
// --------------------------------------------
export async function apiGet(path, auth = true) {
  const res = await axios.get(`${BASE_URL}${path}`, {
    headers: auth ? getAuthHeaders() : {},
  });
  return res.data;
}

export async function apiPost(path, body = {}, auth = true) {
  const res = await axios.post(`${BASE_URL}${path}`, body, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? getAuthHeaders() : {}),
    },
  });
  return res.data;
}

export async function apiPatch(path, body = {}, auth = true) {
  const res = await axios.patch(`${BASE_URL}${path}`, body, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? getAuthHeaders() : {}),
    },
  });
  return res.data;
}

// 🔹 NUEVO: PUT genérico
export async function apiPut(path, body = {}, auth = true) {
  const res = await axios.put(`${BASE_URL}${path}`, body, {
    headers: {
      "Content-Type": "application/json",
      ...(auth ? getAuthHeaders() : {}),
    },
  });
  return res.data;
}

export async function apiDelete(path, auth = true) {
  const res = await axios.delete(`${BASE_URL}${path}`, {
    headers: auth ? getAuthHeaders() : {},
  });
  return res.data;
}

// --------------------------------------------
// 📸 Subida de archivos (multipart/form-data)
// --------------------------------------------
export async function apiUpload(path, formData, auth = true) {
  const res = await axios.post(`${BASE_URL}${path}`, formData, {
    headers: {
      ...(auth ? getAuthHeaders() : {}),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
