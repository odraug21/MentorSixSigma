// src/pages/Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png"
import { motion } from "framer-motion"; // 👈 para la animación

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
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 bg-gray-900 text-white">
        {/* Logo principal con animación */}
        <motion.img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-[180px] w-auto mb-6 drop-shadow-lg"
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
          className="text-xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Mejora continua desde todos los ángulos, analiza y mejora tus procesos de manera sencilla.
        </motion.p>

        <div className="flex space-x-4">
          <Link
            to="/register"
            className="bg-indigo-500 px-6 py-3 rounded-lg text-lg hover:bg-indigo-600"
          >
            Registro
          </Link>
          <Link
            to="/login"
            className="bg-gray-700 px-6 py-3 rounded-lg text-lg hover:bg-gray-600"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* Cómo funciona / Beneficios */}
      <section className="py-20 px-6 bg-gray-800 text-white">
        <h2 className="text-4xl font-bold text-center mb-12 text-indigo-400">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            ["1. Define tu problema", "Describe el problema que quieres resolver con claridad."],
            ["2. Analiza causas raíz", "Identifica las causas principales que generan el problema."],
            ["3. Propón contramedidas", "Diseña acciones para eliminar o reducir las causas."],
            ["4. Da seguimiento", "Monitorea los resultados y ajusta según sea necesario."],
          ].map(([title, text], i) => (
            <div
              key={i}
              className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <h3 className="text-2xl font-semibold mb-2">{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <h2 className="text-4xl font-bold text-center mb-8 text-indigo-400">
          Contáctanos
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={review.name}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={review.email}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          />
          <textarea
            name="message"
            placeholder="Escribe tu mensaje"
            value={review.message}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          ></textarea>
          <button
            type="submit"
            className="bg-indigo-500 px-6 py-3 rounded-lg hover:bg-indigo-600"
          >
            Enviar
          </button>
        </form>

        {/* Listado de reseñas */}
        <div className="mt-10 max-w-xl mx-auto">
          {reviews.map((r, index) => (
            <div key={index} className="bg-gray-800 p-4 mb-4 rounded">
              <h4 className="font-semibold text-indigo-400">{r.name}</h4>
              <p className="text-sm">{r.email}</p>
              <p>{r.message}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;

