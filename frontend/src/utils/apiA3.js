// src/utils/apiA3.js
import { apiGet, apiPost, apiPatch, apiDelete } from "./api.js";


// ✅ Crear nuevo A3
export const crearA3 = async (data) => {
  return await apiPost("/api/a3", data, true);
};

// ✅ Obtener todos los A3 de una empresa
export const listarA3PorEmpresa = async (id_empresa) => {
  return await apiGet(`/api/a3/empresa/${id_empresa}`, true);
};

// ✅ Obtener un A3 por ID
export const obtenerA3 = async (id) => {
  return await apiGet(`/api/a3/${id}`, true);
};

// ✅ Actualizar secciones
export const actualizarSeccionA3 = async (id, section, data) => {
  return await apiPatch(`/api/a3/${id}`, { section, data }, true);
};

// ✅ Eliminar A3
export const eliminarA3 = async (id) => {
  return await apiDelete(`/api/a3/${id}`, true);
};
