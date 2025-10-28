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
import Vsm from "./pages/VSM/Vsm";
import FiveSIntro from "./pages/5S/5sIntro";
import FiveSImplementacion from "./pages/5S/5sImplementacion";
import FiveSAuditoria from "./pages/5S/5sAuditoria";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento";
import FiveSProyectos from "./pages/5S/5sProyectos";
import GwPlan from "./pages/GembaWalk/GwPlan";
import GwIntro from "./pages/GembaWalk/GwIntro";
import GwEjecucion from "./pages/GembaWalk/GwEjecucion";
import GwReporte from "./pages/GembaWalk/GwReporte";
import VsmIntro from "./pages/VSM/VsmIntro";
import VsmMapa from "./pages/VSM/Vsm";
import VsmBuilder from "./pages/VSM/VsmBuilder";


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


          <Route
            path="/sipoc"
            element={
              <ProtectedRoute>
                <Sipoc />
              </ProtectedRoute>
            }
          />

{/* Menú principal de 5S */}
<Route
  path="/5s/intro"
  element={
    <ProtectedRoute>
      <FiveSIntro />
    </ProtectedRoute>
  }
/>

{/* Listado de proyectos */}
<Route
  path="/5s/proyectos"
  element={
    <ProtectedRoute>
      <FiveSProyectos />
    </ProtectedRoute>
  }
/>

{/* Fases del proyecto 5S */}
<Route
  path="/5s/:id/implementacion"
  element={
    <ProtectedRoute>
      <FiveSImplementacion />
    </ProtectedRoute>
  }
/>

<Route
  path="/5s/:id/auditoria"
  element={
    <ProtectedRoute>
      <FiveSAuditoria />
    </ProtectedRoute>
  }
/>

<Route
  path="/5s/:id/seguimiento"
  element={
    <ProtectedRoute>
      <FiveSSeguimiento />
    </ProtectedRoute>
  }
/>



{/* --- Gemba Walk --- */}
<Route
  path="/gemba/intro"
  element={
    <ProtectedRoute>
      <GwIntro />
    </ProtectedRoute>
  }
/>

<Route
  path="/gemba/plan"
  element={
    <ProtectedRoute>
      <GwPlan />
    </ProtectedRoute>
  }
/>

<Route
  path="/gemba/ejecucion"
  element={
    <ProtectedRoute>
      <GwEjecucion />
    </ProtectedRoute>
  }
/>

<Route
  path="/gemba/reporte"
  element={
    <ProtectedRoute>
      <GwReporte />
    </ProtectedRoute>
  }
/>

{/* --- VSM --- */}
<Route
  path="/vsm/intro"
  element={
    <ProtectedRoute>
      <VsmIntro />
    </ProtectedRoute>
  }
/>

<Route
  path="/vsm/Vsm"
  element={
    <ProtectedRoute>
      <VsmMapa />
    </ProtectedRoute>
  }
/>

<Route
  path="/vsm/builder"
  element={
    <ProtectedRoute>
      <VsmBuilder />
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




