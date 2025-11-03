// src/pages/Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer"; // 
import logoprincipal from "../img/logoppl2.png";

const Home = () => {
  const [review, setReview] = useState({ name: "", email: "", message: "" });
  const [reviews, setReviews] = useState([]);

  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (review.name && review.email && review.message) {
      setReviews([...reviews, review]);
      setReview({ name: "", email: "", message: "" });
    }
  };

  return (
    <>
      {/* 🟣 HERO PRINCIPAL */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 bg-gray-900 text-white">
        <motion.img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-[280px] w-auto mb-8 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.h1
          className="text-5xl font-bold mb-4 text-indigo-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Bienvenido a MentorSuites
        </motion.h1>

        <motion.p
          className="text-lg max-w-2xl mb-10 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Mejora continua desde todos los ángulos. Analiza, optimiza y transforma tus procesos con herramientas digitales.
        </motion.p>

        {/* Botones */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="bg-indigo-500 px-8 py-3 rounded-lg text-lg hover:bg-indigo-600 transition"
          >
            Registro
          </Link>
          <Link
            to="/login"
            className="bg-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-gray-600 transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* 💼 SUITE DE HERRAMIENTAS */}
      <section className="py-24 px-6 bg-gray-800 text-white text-center">
        <h2 className="text-4xl font-bold mb-12 text-indigo-400">
          Explora la Suites
        </h2>

        <p className="max-w-3xl mx-auto text-lg mb-16 text-gray-300">
          Desde Lean hasta 5S, analiza, optimiza y transforma tus procesos con
          herramientas digitales de excelencia operacional.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            { title: "A3 Problem Solving", text: "Estructura tus proyectos de mejora continua con un enfoque claro y visual.", icon: "📊" },
            { title: "5S Digital", text: "Implementa orden, limpieza y estandarización en tus áreas operativas.", icon: "🧹" },
            { title: "Gemba Walk", text: "Registra observaciones en terreno y promueve la mejora directa en el lugar de trabajo.", icon: "🚶‍♂️" },
            { title: "VSM – Mapa de Valor", text: "Visualiza el flujo de valor completo y detecta cuellos de botella fácilmente.", icon: "🗺️" },
            { title: "SIPOC", text: "Define proveedores, entradas, procesos, salidas y clientes en un solo clic.", icon: "⚙️" },
            { title: "OEE / OOE / TEEP", text: "Mide y compara la eficiencia real de tus equipos y plantas de producción.", icon: "📈" },
            { title: "Dashboard Integral", text: "Centraliza métricas clave y haz seguimiento a tus indicadores Lean.", icon: "💡" },
            { title: "IA Asistida", text: "Recibe recomendaciones inteligentes y acelera tus ciclos de mejora.", icon: "🤖" },
          ].map(({ title, text, icon }, i) => (
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

      {/* ✉️ CONTACTO */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <h2 className="text-4xl font-bold text-center mb-8 text-indigo-400">
          Contáctanos
        </h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={review.name}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={review.email}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            name="message"
            placeholder="Escribe tu mensaje"
            value={review.message}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-700 text-white h-32 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-indigo-500 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition"
          >
            Enviar
          </button>
        </form>

        {/* Reseñas */}
        {reviews.length > 0 && (
          <div className="mt-12 max-w-xl mx-auto space-y-4">
            {reviews.map((r, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-indigo-400">{r.name}</h4>
                <p className="text-sm text-gray-400">{r.email}</p>
                <p>{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔻 FOOTER */}
      <Footer />
    </>
  );
};

export default Home;

