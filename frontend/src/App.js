// ============================================
// 🌐 IMPORTS PRINCIPALES
// ============================================
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout.jsx";

// ============================================
// 🌍 PÁGINAS PÚBLICAS
// ============================================
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx"; // usado como Contacto

// ============================================
// 🧭 PÁGINAS GENERALES
// ============================================
import Inicio from "./pages/Inicio.jsx";
import Home from "./pages/Home.jsx";

// ============================================
// 🧑‍💼 ADMINISTRACIÓN
// ============================================
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import Empresas from "./pages/Admin/Empresas.jsx";
import Usuarios from "./pages/Admin/Usuarios.jsx";
import Roles from "./pages/Admin/Roles.jsx";
import Modulos from "./pages/Admin/Modulos.jsx";
import Consultas from "./pages/Admin/Consultas.jsx";

// ============================================
// 📘 A3
// ============================================
import A3Intro from "./pages/A3/A3Intro.jsx";
import ListA3 from "./pages/A3/ListA3.jsx";
import CreateA3 from "./pages/A3/CreateA3.jsx";

// ============================================
// 🧭 5S
// ============================================
import FiveSIntro from "./pages/5S/5sIntro.jsx";
import FiveSProyectos from "./pages/5S/5sProyectos.jsx";
import FiveSImplementacion from "./pages/5S/5sImplementacion.jsx";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento.jsx";
import FiveSAuditoria from "./pages/5S/5sAuditoria.jsx";

// ============================================
// 🚶 GEMBA WALK
// ============================================
import GembaIntro from "./pages/GembaWalk/GwIntro.jsx";
import GwPlan from "./pages/GembaWalk/GwPlan.jsx";
import GembaEjecucion from "./pages/GembaWalk/GwEjecucion.jsx";
import GembaReporte from "./pages/GembaWalk/GwReporte.jsx";
import GwListado from "./pages/GembaWalk/GwListado.jsx";


// ============================================
// 🗺️ VSM
// ============================================
import VsmIntro from "./pages/VSM/VsmIntro.jsx";
import VsmBuilder from "./pages/VSM/VsmBuilder.jsx";
import Vsm from "./pages/VSM/Vsm.jsx";

// ============================================
// 🔗 SIPOC
// ============================================
import SipocIntro from "./pages/SIPOC/SipocIntro.jsx";
import SipocBuilder from "./pages/SIPOC/SipocBuilder.jsx";
import SipocResumen from "./pages/SIPOC/SipocResumen.jsx";

// ============================================
// 📊 KPI
// ============================================
import KpiDashboard from "./pages/KPI/KpiDashboard.jsx";

// ============================================
// ⚙️ OEE / OOE / TEEP
// ============================================
import OeeIntro from "./pages/OEE/OeeIntro.jsx";
import OeeBuilder from "./pages/OEE/OeeBuilder.jsx";
import OeeAnalysis from "./pages/OEE/OeeAnalysis.jsx";
import OeeDashboard from "./pages/OEE/OeeDashboard.jsx";

import OoeIntro from "./pages/OOE/OoeIntro.jsx";
import OoeBuilder from "./pages/OOE/OoeBuilder.jsx";
import OoeDashboard from "./pages/OOE/OoeDashboard.jsx";

import TeepIntro from "./pages/TEEP/TeepIntro.jsx";
import TeepBuilder from "./pages/TEEP/TeepBuilder.jsx";
import TeepDashboard from "./pages/TEEP/TeepDashboard.jsx";

// ============================================
// 👥 LEADS / CONTACTOS
// ============================================
import Leads from "./pages/Leads.jsx";

// ============================================
// 🚀 APP ROUTES
// ============================================
export default function App() {
  return (
    <Routes>

      {/* ======================================
          🌍 RUTAS PÚBLICAS
      ====================================== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contacto" element={<Navigate to="/register" replace />} />

      {/* ======================================
          🔒 ZONA PROTEGIDA (con Navbar y Footer)
      ====================================== */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {/* Inicio */}
        <Route path="/inicio" element={<Inicio />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/empresas" element={<Empresas />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/roles" element={<Roles />} />
        <Route path="/admin/modulos" element={<Modulos />} />
        <Route path="/admin/consultas" element={<Consultas />} />

        {/* A3 */}
        <Route path="/a3/intro" element={<A3Intro />} />
        <Route path="/a3/list" element={<ListA3 />} />
        <Route path="/a3/nuevo" element={<CreateA3 />} />
        <Route path="/a3/:id" element={<CreateA3 />} />

        {/* 5S */}
        <Route path="/5s/intro" element={<FiveSIntro />} />
        <Route path="/5s/proyectos" element={<FiveSProyectos />} />
        <Route path="/5s/implementacion/:id" element={<FiveSImplementacion />} />
        <Route path="/5s/seguimiento/:id" element={<FiveSSeguimiento />} />
        <Route path="/5s/auditoria/:id" element={<FiveSAuditoria />} />

        {/* Gemba */}
       <Route path="/gemba/intro" element={<GembaIntro />} />
       <Route path="/gemba/plan" element={<GwPlan />} />
       <Route path="/gemba/ejecucion" element={<GembaEjecucion />} />
       <Route path="/gemba/reporte" element={<GembaReporte />} />
       <Route path="/gemba/listado" element={<GwListado />} /> 
        {/* VSM */}
        <Route path="/vsm/intro" element={<VsmIntro />} />
        <Route path="/vsm/builder" element={<VsmBuilder />} />
        <Route path="/vsm/visual" element={<Vsm />} />

        {/* SIPOC */}
        <Route path="/sipoc/intro" element={<SipocIntro />} />
        <Route path="/sipoc/builder" element={<SipocBuilder />} />
        <Route path="/sipoc/resumen" element={<SipocResumen />} />

        {/* KPI */}
        <Route path="/kpi/dashboard" element={<KpiDashboard />} />

        {/* OEE / OOE / TEEP */}
        <Route path="/oee/intro" element={<OeeIntro />} />
        <Route path="/oee/builder" element={<OeeBuilder />} />
        <Route path="/oee/analysis" element={<OeeAnalysis />} />
        <Route path="/oee/dashboard" element={<OeeDashboard />} />

        <Route path="/ooe/intro" element={<OoeIntro />} />
        <Route path="/ooe/builder" element={<OoeBuilder />} />
        <Route path="/ooe/dashboard" element={<OoeDashboard />} />

        <Route path="/teep/intro" element={<TeepIntro />} />
        <Route path="/teep/builder" element={<TeepBuilder />} />
        <Route path="/teep/dashboard" element={<TeepDashboard />} />

        {/* Leads */}
        <Route path="/leads" element={<Leads />} />

      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
