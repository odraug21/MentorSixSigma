import React from "react";
import { update, set5W2H, setResumen5W2H } from "../../utils/a3Helpers";
import A3Header from "../A3Header";

export default function SectionA({ a3, setA3, goTo, setMessage }) {

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(a3, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${a3.meta.titulo || "a3"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exportado JSON (descarga iniciada)");
    setTimeout(() => setMessage(""), 3000);
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


      <h3 className="text-xl font-semibold text-indigo-300 mb-2">
        A. Describir problema / Situación
      </h3>
      {/* Aquí pones todo lo de problema, objetivo y 5W2H */}
      {/* 1. Descripción problema */}
      <div className="mb-3">
        <label className="text-sm text-gray-400">1. Descripción del problema / Condición actual / Acciones de contención</label>
        <textarea
          value={a3.problema.descripcion}
          onChange={(e) => update(a3, setA3, ["problema", "descripcion"], e.target.value)}
          className="w-full mt-2 p-3 rounded bg-gray-700"
          rows={4}
          placeholder="Describe el problema principal..."
        />
        <textarea
          value={a3.problema.condicionActual}
          onChange={(e) => update(a3, setA3, ["problema", "condicionActual"], e.target.value)}
          className="w-full mt-2 p-3 rounded bg-gray-700"
          rows={3}
          placeholder="Condición actual..."
        />
        <textarea
          value={a3.problema.accionesContencion}
          onChange={(e) => update(a3, setA3, ["problema", "accionesContencion"], e.target.value)}
          className="w-full mt-2 p-3 rounded bg-gray-700"
          rows={2}
          placeholder="Acciones de contención..."
        />
      </div>

      
      {/* Meta y Cumplimiento */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div>
          <label className="text-sm text-gray-400">🎯 Meta (%)</label>
          <input
            type="number"
            value={a3.objetivo.meta}
            onChange={(e) => update(a3, setA3, ["objetivo", "meta"], e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700"
            placeholder="Ej: 95"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">📊 Cumplimiento Actual (%)</label>
          <input
            type="number"
            value={a3.objetivo.cumplimiento}
            onChange={(e) => update(a3, setA3, ["objetivo", "cumplimiento"], e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700"
            placeholder="Ej: 65"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">📉 Brecha (%)</label>
          <input
            type="number"
            readOnly
            value={
              a3.objetivo.meta && a3.objetivo.cumplimiento
                ? a3.objetivo.meta - a3.objetivo.cumplimiento
                : ""
            }
            className="w-full mt-1 p-2 rounded bg-gray-600 text-gray-300"
            placeholder="Auto"
          />
        </div>
      </div>


      {/* 3. Análisis 5W2H */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 font-semibold">3. Análisis 5W2H</label>

        <table className="w-full mt-2 text-left border border-gray-600">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              <th className="px-2 py-1 border text-center">Elemento</th>
              <th className="px-2 py-1 border text-center">Si</th>
              <th className="px-2 py-1 border text-center">No</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: "que", label: "Qué" },
              { key: "cuando", label: "Cuándo" },
              { key: "donde", label: "Dónde" },
              { key: "quien", label: "Quién" },
              { key: "como", label: "Cómo" },
              { key: "cuantos", label: "Cuántos" },
              { key: "por_que", label: "Por qué" },
            ].map(({ key, label }) => (
              <tr key={key}>
                <td className="px-2 py-1 border font-medium">{label}</td>
                <td className="px-2 py-1 border">
                  <textarea
                    value={a3?.analisis5W2H?.[key]?.es || ""}
                    onChange={(e) => set5W2H(a3, setA3, key, "es", e.target.value)}
                    className="w-full p-1 rounded bg-gray-700 text-white"
                    rows={2}
                  />
                </td>
                <td className="px-2 py-1 border">
                  <textarea
                    value={a3?.analisis5W2H?.[key]?.noEs || ""}
                    onChange={(e) => set5W2H(a3, setA3, key, "noEs", e.target.value)}
                    className="w-full p-1 rounded bg-gray-700 text-white"
                    rows={2}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2">
          <label className="text-sm text-gray-400">Resumen lectura 5W2H (IA / manual)</label>
          <textarea
            value={a3.analisis5W2H?.resumen || ""}
            onChange={(e) => setResumen5W2H(a3, setA3, e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700"
            rows={3}
            placeholder="Aquí se generará la síntesis del problema según 5W2H..."
          />
        </div>
      </div>

      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, ["problema", "imagenes"])} // cambia el path según la sección
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.isArray(a3.problema?.imagenes) &&
            a3.problema.imagenes.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-28 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(["problema", "imagenes"], idx)}
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
