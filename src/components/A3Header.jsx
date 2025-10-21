// src/components/A3Header.jsx
import React from "react";
import { update } from "../utils/a3Helpers";

export default function A3Header({ a3, setA3, goTo, setMessage, exportJSON, generatePDF }) {
    const clearDraft = () => {
        if (!window.confirm("¿Borrar borrador actual?")) return;
        setA3((prev) => JSON.parse(JSON.stringify(prev)));
        setMessage("Borrador limpiado");
        setTimeout(() => setMessage(""), 2000);
    };

    const sugerirCausasIA = () => alert("Funcionalidad de IA aún no implementada");

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
            {/* 🔹 Contenedor principal */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* 🔹 Izquierda: campos de texto */}
                <div>
                    <div className="mb-2">
                        <label className="font-semibold text-gray-300 mr-2">Proyecto:</label>
                        <input
                            value={a3.meta.titulo}
                            onChange={(e) => update(a3, setA3, ["meta", "titulo"], e.target.value)}
                            className="bg-gray-700 p-2 rounded text-white w-64"
                            placeholder="Título del A3"
                        />
                    </div>

                    <div className="text-sm text-gray-400 flex items-center gap-4">
                        <div>
                            <label className="font-semibold mr-1">Equipo:</label>
                            <input
                                value={a3.meta.autor}
                                onChange={(e) => update(a3, setA3, ["meta", "autor"], e.target.value)}
                                className="bg-gray-700 p-1 rounded text-white w-48"
                                placeholder="Equipo de Proyecto"
                            />
                        </div>
                        <div>
                            <label className="font-semibold mr-1">Fecha:</label>
                            <input
                                type="date"
                                value={a3.meta.fecha}
                                onChange={(e) => update(a3, setA3, ["meta", "fecha"], e.target.value)}
                                className="bg-gray-700 p-1 rounded text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* 🔹 Derecha: botones */}
                <div className="flex flex-wrap justify-end gap-2">
                    <button
                        onClick={() => {
                            localStorage.setItem("a3-draft", JSON.stringify(a3));
                            setMessage("Guardado");
                            setTimeout(() => setMessage(""), 1500);
                        }}
                        className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700"
                    >
                        Guardar
                    </button>

                    <button
                        onClick={exportJSON}
                        className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
                    >
                        Exportar JSON
                    </button>

                    <button
                        onClick={clearDraft}
                        className="bg-red-600 px-3 py-2 rounded hover:bg-red-700"
                    >
                        Limpiar
                    </button>

                    <button
                        onClick={sugerirCausasIA}
                        className="bg-yellow-600 px-3 py-2 rounded hover:bg-yellow-700 text-black"
                    >
                        Sugerir causas (IA)
                    </button>

                    <button
                        onClick={generatePDF}
                        className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700"
                    >
                        Generar PDF
                    </button>



                    <button
                        onClick={() => goTo("/")}
                        className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-700"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );
}

