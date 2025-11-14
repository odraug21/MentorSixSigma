// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="p-6 text-center bg-gray-900 mt-12 border-t border-gray-700 text-white">
          <p> A3 Mentor, es un desarrollo de Odraug Smart Logistics - Todos los derechos reservados © 2025</p>
      <div className="flex justify-center space-x-4 mt-2">
        <a href="#" className="hover:text-indigo-400">Política de privacidad</a>
        <a href="#" className="hover:text-indigo-400">Términos</a>
        <a href="#" className="hover:text-indigo-400">Redes sociales</a>
      </div>
    </footer>
  );
};

export default Footer;

