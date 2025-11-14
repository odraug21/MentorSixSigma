// src/components/Sections/SectionD.jsx
import React from "react";
import { update } from "../../utils/a3Helpers";

export default function SectionD({ a3, setA3 }) {
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
            <h3 className="text-xl font-semibold text-teal-300 mb-2">D. Validar solución y estandarizar</h3>
            {/* Copia aquí tu código de seguimiento y lecciones aprendidas */}
            <div className="mb-3">
                <label className="text-sm text-gray-400">6. Confirmación del efecto / evidencia</label>
                <textarea value={a3.seguimiento.resultados} onChange={(e) => update(a3, setA3, ["seguimiento", "resultados"], e.target.value)} className="w-full mt-2 p-3 rounded bg-gray-700" rows={4} placeholder="Registra resultados y comparativa pre/post..." />
                <div className="mt-2">
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, ["seguimiento", "imagenes"])} />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {a3.seguimiento.imagenes.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img src={img.url} alt={img.name} className="w-28 h-20 object-cover rounded" />
                                <button type="button" onClick={() => removeImage(["seguimiento", "imagenes"], idx)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 text-xs">x</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="text-sm text-gray-400">7. Lecciones aprendidas / estandarización</label>
                <textarea value={a3.lecciones} onChange={(e) => update(a3, setA3, ["lecciones"], e.target.value)} className="w-full mt-2 p-3 rounded bg-gray-700" rows={4} placeholder="Documenta las lecciones aprendidas y pasos de estandarización..." />
            </div>
        </section>
    );
}


