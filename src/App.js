// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Empresas from "./pages/Admin/Empresas";
import Usuarios from "./pages/Admin/Usuarios";
import Roles from "./pages/Admin/Roles";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";



// src/App.jsx
//A3
import CreateA3 from "./pages/CreateA3";
import MyA3s from "./pages/MyA3s";

// 5S
import FiveSIntro from "./pages/5S/5sIntro";
import FiveSImplementacion from "./pages/5S/5sImplementacion";
import FiveSProyectos from "./pages/5S/5sProyectos";
import FiveSAuditoria from "./pages/5S/5sAuditoria";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento";

// Gemba Walk
import GembaIntro from "./pages/GembaWalk/GwIntro";
import GembaEjecucion from "./pages/GembaWalk/GwEjecucion";
import GembaReporte from "./pages/GembaWalk/GwReporte";

// VSM
import VsmIntro from "./pages/VSM/VsmIntro";
import Vsm from "./pages/VSM/Vsm";
import VsmBuilder from "./pages/VSM/VsmBuilder";

//SIPOC
import SipocIntro from "./pages/SIPOC/SipocIntro";
import SipocBuilder from "./pages/SIPOC/SipocBuilder";
import SipocResumen from "./pages/SIPOC/SipocResumen";

// KPIs
import KpiDashboard from "./pages/KPI/KpiDashboard";

// OEE
import OeeIntro from "./pages/OEE/OeeIntro";
import OeeBuilder from "./pages/OEE/OeeBuilder";
import OeeAnalysis from "./pages/OEE/OeeAnalysis";
import OeeDashboard from "./pages/OEE/OeeDashboard";

//OOE
import OoeIntro from "./pages/OOE/OoeIntro";
import OoeBuilder from "./pages/OOE/OoeBuilder";
import OoeDashboard from "./pages/OOE/OoeDashboard";

// TEEP
import TeepIntro from "./pages/TEEP/TeepIntro";
import TeepBuilder from "./pages/TEEP/TeepBuilder";
import TeepDashboard from "./pages/TEEP/TeepDashboard";



function App() {
  return (
    <Routes>
      {/* 🟢 Páginas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* 🔒 Rutas protegidas bajo el layout */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<Inicio />} />


        {/* NUEVAS RUTAS */}        
        <Route path="/create-a3" element={<CreateA3 />} />
        <Route path="/my-a3s" element={<MyA3s />} />

        {/* 5S */}
        <Route path="/5s/intro" element={<FiveSIntro />} />
        <Route path="/5s/proyectos" element={<FiveSProyectos />} />
        <Route path="/5s/implementacion/:id" element={<FiveSImplementacion />} />
        <Route path="/5s/seguimiento/:id" element={<FiveSSeguimiento />} />
        <Route path="/5s/auditoria/:id" element={<FiveSAuditoria />} />



        <Route path="/gemba/intro" element={<GembaIntro />} />
        <Route path="/vsm/intro" element={<VsmIntro />} />
        <Route path="/sipoc/intro" element={<SipocIntro />} />

        {/* Administración */}
        <Route path="/admin/empresas" element={<Empresas />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/roles" element={<Roles />} />
        <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute roles={["SuperAdmin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

      </Route>
    </Routes>
  );
}

export default App;




