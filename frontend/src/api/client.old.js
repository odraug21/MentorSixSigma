// a3mentor/src/api/client.js

import { API_BASE } from "../config/env.js";

export const apiGet = async (path, auth = true, params = {}) => {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const apiPost = async (path, body, { auth = true } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const r = await fetch(API_BASE + path, { method: "POST", headers, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const apiPatch = async (path, body) => {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API_BASE + path, { method: "PATCH", headers, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};
