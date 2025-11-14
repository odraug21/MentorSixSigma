// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import logoprincipal from "../img/logoppl2.png";

const Home = () => {
  return (
    <>
      {/* 🏠 CABECERA INTERNA */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-gray-900 text-white">
        <motion.img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-[200px] w-auto mb-6 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.h1
          className="text-4xl font-bold mb-4 text-indigo-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Bienvenido a tu espacio en MentorSuites
        </motion.h1>

        <motion.p
          className="text-lg max-w-2xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Explora las herramientas digitales que potencian la mejora continua en tu organización.
        </motion.p>
      </section>

      {/* 💼 SUITE DE HERRAMIENTAS */}
      <section className="py-24 px-6 bg-gray-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-12 text-indigo-400">
          Tus módulos de Excelencia Operacional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "A3 Problem Solving",
              text: "Estructura proyectos de mejora continua con enfoque visual.",
              icon: "📊",
            },
            {
              title: "5S Digital",
              text: "Aplica orden, limpieza y estandarización de manera colaborativa.",
              icon: "🧹",
            },
            {
              title: "Gemba Walk",
              text: "Registra observaciones en terreno para la mejora directa.",
              icon: "🚶‍♂️",
            },
            {
              title: "VSM – Mapa de Valor",
              text: "Visualiza flujos de valor y detecta cuellos de botella.",
              icon: "🗺️",
            },
            {
              title: "SIPOC",
              text: "Define procesos, entradas y salidas con claridad.",
              icon: "⚙️",
            },
            {
              title: "OEE / OOE / TEEP",
              text: "Mide la eficiencia real de tus equipos y plantas.",
              icon: "📈",
            },
            {
              title: "Dashboard Integral",
              text: "Centraliza KPIs clave y monitorea tu desempeño.",
              icon: "💡",
            },
            {
              title: "IA Asistida",
              text: "Recibe análisis inteligentes y sugerencias automáticas.",
              icon: "🤖",
            },
          ].map(({ title, text, icon }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gray-700 rounded-xl shadow-lg hover:bg-gray-600 transition duration-300"
            >
              <div className="text-5xl mb-4">{icon}</div>
              <h3 className="text-2xl font-semibold mb-2 text-indigo-300">
                {title}
              </h3>
              <p className="text-gray-300">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔻 FOOTER */}
      <Footer />
    </>
  );
};

export default Home;



