import React from "react";
import { update } from "../../utils/a3Helpers";


export default function SectionB({ a3, setA3 }) {
  const setCausaCategoria = (key, idx, value) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.causas[key][idx] = value;
      return copy;
    });
  };

  const removeCausaCategoria = (key, idx) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.causas[key].splice(idx, 1);
      return copy;
    });
  };

  const addCausaCategoria = (key) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.causas[key].push("");
      return copy;
    });
  };

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
      <h3 className="text-xl font-semibold text-purple-300 mb-2">B. Encontrar causa raíz (Diagrama Ishikawa)</h3>

            <p className="text-sm text-gray-400 mb-4">
              Identifica las causas según su origen. Posteriormente podrás generar una redacción del problema con ayuda de IA.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "hombre", label: "Hombre" },
                { key: "maquina", label: "Máquina" },
                { key: "metodo", label: "Método" },
                { key: "material", label: "Material" },
                { key: "entorno", label: "Entorno" },
                { key: "medida", label: "Medida" },
              ].map(({ key, label }) => (
                <div key={key} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-indigo-300 mb-2">{label}</h4>
                  <div className="space-y-2">
                    {(a3.causas?.[key] || []).map((c, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <textarea
                          value={c}
                          onChange={(e) => setCausaCategoria(key, idx, e.target.value)}
                          className="flex-1 p-2 rounded bg-gray-800 text-white"
                          rows={2}
                          placeholder={`Causa relacionada con ${label.toLowerCase()}...`}
                        />
                        <button
                          type="button"
                          onClick={() => removeCausaCategoria(key, idx)}
                          className="bg-red-600 px-2 rounded hover:bg-red-700"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addCausaCategoria(key)}
                    className="mt-2 bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
                  >
                    Añadir causa
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-sm text-gray-400">Redacción del problema (preparada para IA)</label>
              <textarea
                value={a3.causas.redaccionProblema}
                onChange={(e) => update(a3, setA3, ["causas", "redaccionProblema"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={4}
                placeholder="Aquí se generará automáticamente la redacción del problema..."
              />
            </div>
      
<div className="mt-2">
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => handleImageUpload(e, ["causas", "imagenes"])} // cambia el path según la sección
  />
  <div className="flex flex-wrap gap-2 mt-2">
    {Array.isArray(a3.causas.imagenes) &&
      a3.causas.imagenes.map((img, idx) => (
        <div key={idx} className="relative">
          <img
            src={img.url}
            alt={img.name}
            className="w-28 h-20 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => removeImage(["causas", "imagenes"], idx)}
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
