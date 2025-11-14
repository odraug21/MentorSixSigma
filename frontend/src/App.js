// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🌍 Páginas públicas
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
// ⛔️ Register ya no se usa como registro: lo redirigimos a Contacto
import Register from "./pages/Register.jsx";
// import Contacto from "./pages/Contacto.jsx"; // si más adelante lo usas, agregar .jsx

// 🔒 Layouts y protecciones
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout.jsx";

// 🏠 Páginas internas
import Home from "./pages/Home.jsx";
import Inicio from "./pages/Inicio.jsx";

// 👔 Administración
import Empresas from "./pages/Admin/Empresas.jsx";
import Usuarios from "./pages/Admin/Usuarios.jsx";
import Roles from "./pages/Admin/Roles.jsx";
import Modulos from "./pages/Admin/Modulos.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import Consultas from "./pages/Admin/Consultas.jsx";

// 📘 A3
import A3Intro from "./pages/A3/A3Intro.jsx";
import ListA3 from "./pages/A3/ListA3.jsx";
import CreateA3 from "./pages/A3/CreateA3.jsx";
import MyA3s from "./pages/A3/MyA3s.jsx";

// 🧭 5S
import FiveSIntro from "./pages/5S/5sIntro.jsx";
import FiveSProyectos from "./pages/5S/5sProyectos.jsx";
import FiveSImplementacion from "./pages/5S/5sImplementacion.jsx";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento.jsx";
import FiveSAuditoria from "./pages/5S/5sAuditoria.jsx";

// 🚶 Gemba Walk
import GembaIntro from "./pages/GembaWalk/GwIntro.jsx";
import GembaEjecucion from "./pages/GembaWalk/GwEjecucion.jsx";
import GembaReporte from "./pages/GembaWalk/GwReporte.jsx";

// 🗺️ VSM
import VsmIntro from "./pages/VSM/VsmIntro.jsx";
import Vsm from "./pages/VSM/Vsm.jsx";
import VsmBuilder from "./pages/VSM/VsmBuilder.jsx";

// ⚙️ SIPOC
import SipocIntro from "./pages/SIPOC/SipocIntro.jsx";
import SipocBuilder from "./pages/SIPOC/SipocBuilder.jsx";
import SipocResumen from "./pages/SIPOC/SipocResumen.jsx";

// 📊 KPIs / OEE / OOE / TEEP
import KpiDashboard from "./pages/KPI/KpiDashboard.jsx";

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

// 👥 Leads (nuevo)
import Leads from "./pages/Leads.jsx";

function App() {
  return (
    <Routes>

      {/* 🌍 Páginas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* 📩 Usamos Register.jsx como formulario de contacto */}
      <Route path="/register" element={<Register />} />

      {/* Alias /contacto → redirige a /register */}
      <Route path="/contacto" element={<Navigate to="/register" replace />} />

      {/* 🔒 Área protegida */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {/* 🏠 Inicio general e interno */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/home" element={<Home />} />

        {/* 👥 Leads (visible para equipo) */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute roles={["SuperAdmin", "Admin", "Operativo"]}>
              <Leads />
            </ProtectedRoute>
          }
        />

        {/* 👔 Administración */}
        <Route path="/admin/empresas" element={<Empresas />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/roles" element={<Roles />} />
        <Route path="/admin/consultas" element={<Consultas />} />

        {/* 🔐 Solo SuperAdmin */}
        <Route
          path="/admin/modulos"
          element={
            <ProtectedRoute roles={["SuperAdmin"]}>
              <Modulos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["SuperAdmin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/consultas"
          element={
            <ProtectedRoute roles={["SuperAdmin"]}>
              <Consultas />
            </ProtectedRoute>
          }
        />

        {/* 📘 A3 */}
        <Route path="/a3" element={<A3Intro />} />
        <Route path="/a3/list" element={<ListA3 />} />
        <Route path="/a3/nuevo" element={<CreateA3 />} />
        <Route path="/a3/:id" element={<CreateA3 />} />

        {/* 🧭 5S */}
        <Route path="/5s/intro" element={<FiveSIntro />} />
        <Route path="/5s/proyectos" element={<FiveSProyectos />} />
        <Route path="/5s/implementacion/:id" element={<FiveSImplementacion />} />
        <Route path="/5s/seguimiento/:id" element={<FiveSSeguimiento />} />
        <Route path="/5s/auditoria/:id" element={<FiveSAuditoria />} />

        {/* 🚶 Gemba */}
        <Route path="/gemba/intro" element={<GembaIntro />} />
        <Route path="/gemba/ejecucion" element={<GembaEjecucion />} />
        <Route path="/gemba/reporte" element={<GembaReporte />} />

        {/* 🧩 VSM */}
        <Route path="/vsm/intro" element={<VsmIntro />} />
        <Route path="/vsm/builder" element={<VsmBuilder />} />
        <Route path="/vsm/visual" element={<Vsm />} />

        {/* 🔗 SIPOC */}
        <Route path="/sipoc/intro" element={<SipocIntro />} />
        <Route path="/sipoc/builder" element={<SipocBuilder />} />
        <Route path="/sipoc/resumen" element={<SipocResumen />} />

        {/* 📊 KPI / OEE / OOE / TEEP */}
        <Route path="/kpi/dashboard" element={<KpiDashboard />} />

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
      </Route>

      {/* Catch-all → Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
