import React from "react";
import { update } from "../../utils/a3Helpers";


export default function SectionC({ a3, setA3 }) {
  const addContramedida = () => setA3(prev => ({ ...prev, contramedidas: { ...prev.contramedidas, lista: [...prev.contramedidas.lista, ""] } }));
  const removeContramedida = i => setA3(prev => ({ ...prev, contramedidas: { ...prev.contramedidas, lista: prev.contramedidas.lista.filter((_, idx) => idx !== i) } }));
  const setContramedida = (i, value) => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.contramedidas.lista[i] = value; return copy; });

  const addAccion = () => setA3(prev => ({ ...prev, acciones: [...prev.acciones, { accion: "", responsable: "", fecha: "", estado: "Pendiente" }] }));
  const setAccionField = (idx, field, value) => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.acciones[idx][field] = value; return copy; });
  const removeAccion = idx => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.acciones.splice(idx, 1); return copy; });

    // 🔹 Maneja la carga de imágenes y las convierte a base64
const handleImageUpload = (e, path) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setA3((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        let cur = copy;
        for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
        if (!Array.isArray(cur[path[path.length - 1]])) cur[path[path.length - 1]] = [];
        cur[path[path.length - 1]].push({
          name: file.name,
          url: event.target.result, // 👈 base64 del archivo
        });
        return copy;
      });
    };
    reader.readAsDataURL(file); // convierte a base64
  });
};

// 🔹 Elimina una imagen seleccionada
const removeImage = (path, idx) => {
  setA3((prev) => {
    const copy = JSON.parse(JSON.stringify(prev));
    let cur = copy;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]].splice(idx, 1);
    return copy;
  });
};


  return (
    <section className="w-full bg-gray-800 p-4 rounded-lg border border-gray-700 col-span-2">


      
      <h3 className="text-xl font-semibold text-red-300 mb-2">C. Resolver problema / Contramedidas</h3>


      {/* Copia aquí tu código de contramedidas y tabla de acciones */}

      <div className="mb-3">
              <label className="text-sm text-gray-400">4. Contramedidas propuestas</label>
              <div className="space-y-2 mt-2">
                {a3.contramedidas.lista.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <textarea value={c} onChange={(e) => setContramedida(idx, e.target.value)} className="flex-1 p-2 rounded bg-gray-700" rows={2} />
                    <button type="button" onClick={() => removeContramedida(idx)} className="bg-red-600 px-2 rounded hover:bg-red-700">Eliminar</button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button type="button" onClick={addContramedida} className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Añadir contramedida</button>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-400">5. Plan de acciones correctivas (tabla)</label>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-300">
                      <th className="px-2 py-1">Acción</th>
                      <th className="px-2 py-1">Responsable</th>
                      <th className="px-2 py-1">Fecha</th>
                      <th className="px-2 py-1">Estado</th>
                      <th className="px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a3.acciones.map((row, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="px-2 py-1"><input value={row.accion} onChange={(e) => setAccionField(idx, "accion", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1"><input value={row.responsable} onChange={(e) => setAccionField(idx, "responsable", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1"><input type="date" value={row.fecha} onChange={(e) => setAccionField(idx, "fecha", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1">
                          <select value={row.estado} onChange={(e) => setAccionField(idx, "estado", e.target.value)} className="bg-gray-700 p-1 rounded">
                            <option>Pendiente</option>
                            <option>En progreso</option>
                            <option>Completada</option>
                            <option>Demorado</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <button type="button" onClick={() => removeAccion(idx)} className="bg-red-600 px-2 py-1 rounded">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2">
                  <button type="button" onClick={addAccion} className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Añadir acción</button>
                </div>
              </div>
            </div>

<div className="mt-2">
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => handleImageUpload(e, ["contramedidas", "imagenes"])} // cambia el path según la sección
  />
  <div className="flex flex-wrap gap-2 mt-2">
    {Array.isArray(a3.contramedidas.imagenes) &&
      a3.contramedidas.imagenes.map((img, idx) => (
        <div key={idx} className="relative">
          <img
            src={img.url}
            alt={img.name}
            className="w-28 h-20 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => removeImage(["contramedidas", "imagenes"], idx)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
          >
            x
          </button>
        </div>
      ))}
  </div>
</div>


    </section>
  );
}
