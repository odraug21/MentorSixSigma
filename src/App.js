// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreateA3 from "./pages/CreateA3";
import MyA3s from "./pages/MyA3s";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import ProtectedRoute from "./components/ProtectedRoute";
import Sipoc from "./pages/Sipoc";
import Vsm from "./pages/Vsm";
import FiveSIntro from "./pages/5S/5sIntro";
import FiveSImplementacion from "./pages/5S/5sImplementacion";
import FiveSAuditoria from "./pages/5S/5sAuditoria";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento";


function App() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <div className="flex-grow p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 🔒 Rutas protegidas */}
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-a3"
            element={
              <ProtectedRoute>
                <CreateA3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-a3s"
            element={
              <ProtectedRoute>
                <MyA3s />
              </ProtectedRoute>
            }
          />

          <Route path="/5s/intro"
            element={
              <ProtectedRoute>
                <FiveSIntro />
              </ProtectedRoute>
            }
          />

          <Route path="/5s/implementacion"
            element={
              <ProtectedRoute>
                <FiveSImplementacion />
              </ProtectedRoute>
            }
          />

          <Route path="/5s/auditoria"
            element={
              <ProtectedRoute>
                <FiveSAuditoria />
              </ProtectedRoute>
            }
          />


          <Route path="/5s/seguimiento"
            element={
              <ProtectedRoute>
                <FiveSSeguimiento />
              </ProtectedRoute>
            }
          />

          




        </Routes>
      </div>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;




