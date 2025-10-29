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
import SipocIntro from "./pages/SIPOC/SipocIntro.jsx";
import SipocBuilder from "./pages/SIPOC/SipocBuilder.jsx";
import SipocResumen from "./pages/SIPOC/SipocResumen.jsx";
import OeeIntro from "./pages/OEE/OeeIntro.jsx";
import OeeBuilder from "./pages/OEE/OeeBuilder.jsx";
import OeeDashboard from "./pages/OEE/OeeDashboard.jsx";
import OoeIntro from "./pages/OOE/OoeIntro.jsx";
import OoeBuilder from "./pages/OOE/OoeBuilder.jsx";
import OoeDashboard from "./pages/OOE/OoeDashboard.jsx";
import TeepIntro from "./pages/TEEP/TeepIntro.jsx";
import TeepBuilder from "./pages/TEEP/TeepBuilder.jsx";
import TeepDashboard from "./pages/TEEP/TeepDashboard.jsx";
import KpiDashboard from "./pages/KPI/KpiDashboard.jsx";

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

          {/* Menú principal SIPOC */}
          <Route
            path="/sipoc/intro"
            element={
              <ProtectedRoute>
                <SipocIntro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sipoc/builder"
            element={
              <ProtectedRoute>
                <SipocBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sipoc/resumen"
            element={
              <ProtectedRoute>
                <SipocResumen />
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


        {/* --- OEE --- */}
          <Route
            path="/oee/intro"
            element={
              <ProtectedRoute>
                <OeeIntro />
              </ProtectedRoute>
            }
          />

          <Route
            path="/oee/dashboard"
            element={
              <ProtectedRoute>
                <OeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/oee/builder"
            element={
              <ProtectedRoute>
                <OeeBuilder />
              </ProtectedRoute>
            }
          />

{/* --- OOE --- */}
<Route
  path="/ooe/intro"
  element={
    <ProtectedRoute>
      <OoeIntro />
    </ProtectedRoute>
  }
/>

<Route
  path="/ooe/builder"
  element={
    <ProtectedRoute>
      <OoeBuilder />
    </ProtectedRoute>
  }
/>

<Route
  path="/ooe/dashboard"
  element={
    <ProtectedRoute>
      <OoeDashboard />
    </ProtectedRoute>
  }
/>

{/* --- TEEP --- */}
<Route
  path="/teep/intro"
  element={
    <ProtectedRoute>
      <TeepIntro />
    </ProtectedRoute>
  }
/>

<Route
  path="/teep/builder"
  element={
    <ProtectedRoute>
      <TeepBuilder />
    </ProtectedRoute>
  }
/>

<Route
  path="/teep/dashboard"
  element={
    <ProtectedRoute>
      <TeepDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/kpi/dashboard"
  element={
    <ProtectedRoute>
      <KpiDashboard />
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




