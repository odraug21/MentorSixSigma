// frontend/src/pages/5S/5sSeguimiento.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { exportarSeguimientoPDF } from "../../reports/5sSeguimientoPDF";
import { apiGet } from "../../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🔹 Estructura base por etapa 5S
const BASE_5S = [
  { nombre: "1S · Seiri (Clasificar)", inicio: "", fin: "", avance: 0 },
  { nombre: "2S · Seiton (Ordenar)", inicio: "", fin: "", avance: 0 },
  { nombre: "3S · Seiso (Limpiar)", inicio: "", fin: "", avance: 0 },
  { nombre: "4S · Seiketsu (Estandarizar)", inicio: "", fin: "", avance: 0 },
  { nombre: "5S · Shitsuke (Disciplina)", inicio: "", fin: "", avance: 0 },
];

export default function FiveSSeguimiento() {
  const navigate = useNavigate();
  const { id } = useParams(); // id = proyecto 5S
  const usuario =
    JSON.parse(localStorage.getItem("user"))?.email || "anonimo";

  const [datos, setDatos] = useState(BASE_5S);
  const [proyecto, setProyecto] = useState(null);

  // ⚙️ Helper fechas
  const diasEntre = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("es-CL") : "—";

  // 1️⃣ Cargar datos del proyecto (nombre para PDF / encabezado)
  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        const data = await apiGet(`/5s/proyectos/${id}`, true);
        setProyecto(data);
      } catch (err) {
        console.error("❌ Error cargando proyecto 5S:", err);
      }
    };
    cargarProyecto();
  }, [id]);

  // 2️⃣ Cargar IMPLEMENTACIÓN 5S y armar resumen por etapa
  useEffect(() => {
    const cargarSeguimiento = async () => {
      try {
        const res = await apiGet(`/5s/implementacion/${id}`, true);

        const secciones = Array.isArray(res?.secciones)
          ? res.secciones
          : [];

        // Construimos un arreglo con inicio, fin y avance por cada S
        const fusionados = BASE_5S.map((base) => {
          const sec = secciones.find((s) => s.nombre === base.nombre);

          if (!sec) {
            // Si aún no tiene nada en esa S, devolvemos base
            return { ...base };
          }

          const fechas = [];

          (sec.tareas || []).forEach((t) => {
            if (t.inicio) fechas.push(new Date(t.inicio));
            if (t.fin) fechas.push(new Date(t.fin));
            (t.subtareas || []).forEach((st) => {
              if (st.inicio) fechas.push(new Date(st.inicio));
              if (st.fin) fechas.push(new Date(st.fin));
            });
          });

          const fechasValidas = fechas
            .filter(Boolean)
            .sort((a, b) => a - b);

          const inicio = fechasValidas[0] || null;
          const fin = fechasValidas[fechasValidas.length - 1] || null;

          return {
            nombre: base.nombre,
            inicio: inicio ? inicio.toISOString().slice(0, 10) : "",
            fin: fin ? fin.toISOString().slice(0, 10) : "",
            avance: Number(sec.avance || 0),
          };
        });

        console.log("🔍 Datos seguimiento 5S:", fusionados);
        setDatos(fusionados);
      } catch (err) {
        console.error("❌ Error cargando seguimiento 5S:", err);
        setDatos(BASE_5S); // fallback
      }
    };

    cargarSeguimiento();
  }, [id]);

  // 3️⃣ Promedio global
  const promedio = useMemo(
    () =>
      datos.reduce((acc, d) => acc + Number(d.avance || 0), 0) /
      (datos.length || 1),
    [datos]
  );

  const hoy = new Date();

  // 4️⃣ Datos para el gráfico tipo Gantt
  const chartData = {
    labels: datos.map((d) => d.nombre),
    datasets: [
      {
        label: "Planificado (duración en días)",
        data: datos.map((d) => diasEntre(d.inicio, d.fin)),
        backgroundColor: "rgba(59,130,246,0.2)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        barThickness: 30,
      },
      {
        label: "Avance (%)",
        data: datos.map(
          (d) => (Number(d.avance || 0) / 100) * diasEntre(d.inicio, d.fin)
        ),
        backgroundColor: "#22c55e",
        barThickness: 30,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#fff" } },
      title: {
        display: true,
        text: "Cronograma y Avance de Implementación 5S",
        color: "#fff",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.dataset.label === "Avance (%)"
              ? `Avance: ${datos[ctx.dataIndex].avance}%`
              : `Duración: ${diasEntre(
                  datos[ctx.dataIndex].inicio,
                  datos[ctx.dataIndex].fin
                )} días`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#fff" }, grid: { color: "#444" } },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Duración (días)", color: "#aaa" },
        ticks: { color: "#fff" },
        grid: { color: "#444" },
      },
    },
  };

  const guardar = () => alert("Seguimiento actualizado ✅");

  const generarPDF = () => {
    const nombreProyecto = proyecto?.nombre || `Proyecto 5S #${id}`;
    exportarSeguimientoPDF(datos, nombreProyecto, usuario);
  };

  useEffect(() => {
    console.log("🔍 Datos resumen seguimiento:", datos);
  }, [datos]);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between mb-8 items-center">
        <h1 className="text-3xl font-bold text-indigo-400">Seguimiento 5S</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/5s/proyectos")}
            className="bg-indigo-700 px-3 py-2 rounded-lg font-semibold shadow-lg transition"
          >
            Volver a proyectos
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
          <button
            onClick={generarPDF}
            className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700"
          >
            PDF
          </button>
        </div>
      </div>

      {/* 🔹 Progreso general */}
      <div className="bg-gray-800 p-5 rounded-lg mb-8">
        <p className="text-sm text-gray-400 mb-1">
          Progreso global del programa:
        </p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${promedio}%` }}
          ></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-300">
          {promedio.toFixed(1)}%
        </p>
      </div>

      {/* 🔹 Tabla de resumen */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          Resumen por Etapa
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="p-2 border border-gray-600">Etapa</th>
              <th className="p-2 border border-gray-600">Inicio</th>
              <th className="p-2 border border-gray-600">Fin</th>
              <th className="p-2 border border-gray-600">Duración (días)</th>
              <th className="p-2 border border-gray-600">Avance (%)</th>
              <th className="p-2 border border-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => {
              const fin = d.fin ? new Date(d.fin) : null;
              const retrasada = fin && hoy > fin && d.avance < 100;
              return (
                <tr
                  key={i}
                  className="text-gray-300 border-t border-gray-700"
                >
                  <td className="p-2 border border-gray-700">{d.nombre}</td>
                  <td className="p-2 border border-gray-700">
                    {formatDate(d.inicio)}
                  </td>
                  <td className="p-2 border border-gray-700">
                    {formatDate(d.fin)}
                  </td>
                  <td className="p-2 border border-gray-700 text-center">
                    {diasEntre(d.inicio, d.fin)}
                  </td>
                  <td className="p-2 border border-gray-700 text-center font-semibold">
                    {d.avance}%
                  </td>
                  <td
                    className={`p-2 border border-gray-700 text-center font-semibold ${
                      retrasada
                        ? "text-red-400"
                        : d.avance === 100
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {retrasada
                      ? "⚠️ Demorada"
                      : d.avance === 100
                      ? "✅ Completada"
                      : "⏳ En progreso"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🔹 Mini gráfico tipo Gantt */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
