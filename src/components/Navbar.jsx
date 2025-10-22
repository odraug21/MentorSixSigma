import React from "react";
import { Link } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";


const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-800">
      <div className="flex items-center gap-3">
  <img
  src={logoprincipal}
  alt="A3 Mentor Logo"
  className="h-24 w-auto bg-white/10 p-1 rounded-md backdrop-blur-sm"
/>

  
</div>


      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:text-indigo-300">Inicio</Link></li> 
        <li><Link to="/create-a3" className="hover:text-indigo-300">Crear A3</Link></li>
        <li><Link to="/my-a3s" className="hover:text-indigo-300">Mis A3</Link></li>
        <li><Link to="/register" className="hover:text-indigo-300">Registro</Link></li>
      </ul>
      {/*<button className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600">Iniciar sesión</button>*/}
    </nav>
  );
};

export default Navbar;

