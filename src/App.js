// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreateA3 from "./pages/CreateA3";
import MyA3s from "./pages/MyA3s";
import Register from "./pages/Register";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-a3" element={<CreateA3 />} />
          <Route path="/my-a3s" element={<MyA3s />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;


