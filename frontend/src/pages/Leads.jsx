import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../api/client.old";

const estados = ["Nuevo", "En proceso", "Cerrado"];
const prioridades = ["Baja", "Media", "Alta"];

export default function Leads() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/api/contactos", true, { q, estado, prioridad, page, pageSize });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [q, estado, prioridad, page]);

  const onUpdate = async (id, payload) => {
    await apiPatch(`/api/contactos/${id}`, payload);
    fetchData();
  };

  const onAddNota = async (id) => {
    const nota = prompt("Escribe una nota interna");
    if (!nota) return;
    await apiPost(`/api/contactos/${id}/notas`, { nota });
    fetchData();
  };

  const pages = useMemo(() => Math.ceil(total / pageSize), [total]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Leads / Contactos</h1>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nombre, email, empresa..."
               className="border rounded p-2 w-64" />
        <select value={estado} onChange={(e)=>setEstado(e.target.value)} className="border rounded p-2">
          <option value="">Estado: todos</option>
          {estados.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={prioridad} onChange={(e)=>setPrioridad(e.target.value)} className="border rounded p-2">
          <option value="">Prioridad: todas</option>
          {prioridades.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="ml-auto text-sm text-gray-600">
          {loading ? "Cargando..." : `${total} resultados`}
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Fecha</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Empresa</th>
              <th className="text-left p-2">Interés</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Prioridad</th>
              <th className="text-left p-2">Asignado a</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{new Date(it.created_at).toLocaleString()}</td>
                <td className="p-2">{it.nombre}</td>
                <td className="p-2">{it.email}</td>
                <td className="p-2">{it.empresa || "-"}</td>
                <td className="p-2">{it.interes || "-"}</td>
                <td className="p-2">
                  <select value={it.estado} onChange={(e)=>onUpdate(it.id,{estado:e.target.value})}
                          className="border rounded p-1">
                    {estados.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <select value={it.prioridad} onChange={(e)=>onUpdate(it.id,{prioridad:e.target.value})}
                          className="border rounded p-1">
                    {prioridades.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <input defaultValue={it.asignado_a || ""}
                         onBlur={(e)=>onUpdate(it.id,{asignado_a:e.target.value})}
                         placeholder="correo interno"
                         className="border rounded p-1 w-44" />
                </td>
                <td className="p-2">
                  <button onClick={()=>onAddNota(it.id)}
                          className="text-indigo-600 hover:underline mr-2">+ Nota</button>
                  <details className="inline-block">
                    <summary className="cursor-pointer text-gray-600">Ver</summary>
                    <div className="p-2 bg-gray-50 rounded mt-2 w-[420px] whitespace-pre-wrap">
                      <div className="text-xs text-gray-500 mb-1">Tel: {it.telefono || "-"}</div>
                      <div className="font-semibold">Mensaje</div>
                      {it.mensaje || "(sin mensaje)"}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr><td colSpan={9} className="p-6 text-center text-gray-500">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex gap-2 items-center justify-end mt-4">
          <button disabled={page<=1} onClick={()=>setPage((p)=>p-1)}
                  className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Página {page} de {pages}</span>
          <button disabled={page>=pages} onClick={()=>setPage((p)=>p+1)}
                  className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
        </div>
      )}
    </div>
  );
}
