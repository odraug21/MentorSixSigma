// src/pages/Home.jsx
import React, { useState } from "react"; // importa React y useState
import { Link } from "react-router-dom"; // importa Link para navegación

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
        <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-gray-900 text-white">
        <h1 className="text-5xl font-bold mb-4 text-indigo-400">Bienvenido a A3 Mentor</h1>
        <p className="text-xl mb-8">Crea, analiza y mejora tus procesos de manera sencilla</p>
        <div className="flex space-x-4">
          <Link to="/register" className="bg-indigo-500 px-6 py-3 rounded-lg text-lg hover:bg-indigo-600">Registro</Link>
          <Link to="/" className="bg-gray-700 px-6 py-3 rounded-lg text-lg hover:bg-gray-600">Iniciar sesión</Link>
        </div>
      </section>

      {/* Cómo funciona / Beneficios */}
      <section className="py-20 px-6 bg-gray-800 text-white">
        <h2 className="text-4xl font-bold text-center mb-12 text-indigo-400">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-2xl font-semibold mb-2">1. Define tu problema</h3>
            <p>Describe el problema que quieres resolver con claridad.</p>
          </div>
          <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-2xl font-semibold mb-2">2. Analiza causas raíz</h3>
            <p>Identifica las causas principales que generan el problema.</p>
          </div>
          <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-2xl font-semibold mb-2">3. Propón contramedidas</h3>
            <p>Diseña acciones para eliminar o reducir las causas.</p>
          </div>
          <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            <h3 className="text-2xl font-semibold mb-2">4. Da seguimiento</h3>
            <p>Monitorea los resultados y ajusta según sea necesario.</p>
          </div>
        </div>
      </section>

      {/* Sección de Reseñas */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <h2 className="text-4xl font-bold text-center mb-8 text-indigo-400">Deja tu reseña</h2>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
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
            placeholder="Escribe tu reseña"
            value={review.message}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          ></textarea>
          <button type="submit" className="bg-indigo-500 px-6 py-3 rounded-lg hover:bg-indigo-600">Enviar</button>
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

