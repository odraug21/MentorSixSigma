import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* Aquí se renderiza la página hija */}
      </main>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
