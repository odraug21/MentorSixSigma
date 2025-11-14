// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoprincipal from "../img/logoppl2.png";
import Footer from "../components/Footer";
import PublicNavbar from "../components/PublicNavbar";

const Landing = () => {
  const modulosPreview = [
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
  ];

  return (
    <>
      <PublicNavbar />

      {/* 🔹 HERO DE PRESENTACIÓN */}
      <section className="flex flex-col items-center justify-center min-h-[85vh] text-center bg-gray-900 text-white px-6">
        <motion.img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-[250px] w-auto mb-8 drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />

        <motion.h1
          className="text-5xl font-bold mb-6 text-indigo-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Excelencia Operacional Digital
        </motion.h1>

        <p className="text-lg max-w-2xl text-gray-300 mb-10">
          MentorSuites integra las herramientas Lean, Kaizen, 5S y Six Sigma
          en una plataforma moderna que impulsa la mejora continua,
          la colaboración y la productividad en todos los niveles de tu empresa.
        </p>
      </section>

      {/* 💼 QUIÉNES SOMOS */}
      <section className="py-24 px-8 bg-gray-800 text-white text-center">
        <h2 className="text-4xl font-bold mb-10 text-indigo-400">Quiénes Somos</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          Somos un equipo apasionado por la mejora continua. MentorSuites nace
          con el propósito de digitalizar las metodologías de excelencia
          operacional y facilitar la toma de decisiones basada en datos. Nuestra
          misión es transformar la cultura de mejora en una experiencia digital,
          colaborativa e intuitiva.
        </p>
      </section>

      {/* 🧭 MISIÓN / VISIÓN / VALORES */}
      <section className="bg-gray-900 py-20 px-8 grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-white">
        {[
          {
            title: "Misión",
            text: "Facilitar la adopción de prácticas de excelencia operacional mediante herramientas digitales accesibles y potentes.",
            icon: "🎯",
          },
          {
            title: "Visión",
            text: "Ser la suite líder en transformación digital de procesos Lean y mejora continua en Latinoamérica y el mundo.",
            icon: "🌎",
          },
          {
            title: "Valores",
            text: "Innovación, colaboración, aprendizaje continuo y compromiso con la mejora diaria.",
            icon: "💡",
          },
        ].map(({ title, text, icon }, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            className="p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition"
          >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-2xl font-semibold text-indigo-300 mb-2">{title}</h3>
            <p className="text-gray-300">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* 💼 DEMO DE MÓDULOS (del Home.jsx) */}
      <section className="py-24 px-6 bg-gray-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-12 text-indigo-400">
          Tus módulos de Excelencia Operacional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {modulosPreview.map(({ title, text, icon }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gray-700 rounded-xl shadow-lg hover:bg-gray-600 transition duration-300"
            >
              <div className="text-5xl mb-4">{icon}</div>
              <h3 className="text-2xl font-semibold mb-2 text-indigo-300">{title}</h3>
              <p className="text-gray-300">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🤝 CTA FINAL */}
      <section className="py-20 px-8 text-center bg-indigo-600 text-white">
        <h2 className="text-4xl font-bold mb-6">Transforma tu gestión hoy</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Únete a la comunidad de empresas que ya optimizan sus procesos con MentorSuites.
        </p>
        <Link
          to="/register"
          className="bg-white text-indigo-600 px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Contactanos
        </Link>
      </section>

      <Footer />
    </>
  );
};

export default Landing;
