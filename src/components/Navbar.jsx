import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-800">
      <div className="text-2xl font-bold text-indigo-400">A3 Mentor</div>
      <ul className="flex space-x-6">
         <li><Link to="/" className="hover:text-indigo-300">Home</Link></li> 
        <li><Link to="/create-a3" className="hover:text-indigo-300">Crear A3</Link></li>
        <li><Link to="/my-a3s" className="hover:text-indigo-300">Mis A3</Link></li>
        <li><Link to="/register" className="hover:text-indigo-300">Registro</Link></li>
      </ul>
      <button className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600">Iniciar sesión</button>
    </nav>
  );
};

export default Navbar;

