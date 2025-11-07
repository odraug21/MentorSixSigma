// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";



// 🌍 Páginas públicas
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔒 Layouts y protecciones
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";

// 🏠 Páginas internas
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";

// 👔 Administración
import Empresas from "./pages/Admin/Empresas";
import Usuarios from "./pages/Admin/Usuarios";
import Roles from "./pages/Admin/Roles";
import Modulos from "./pages/Admin/Modulos";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Consultas from "./pages/Admin/Consultas";


// 📘 A3
import CreateA3 from "./pages/A3/CreateA3";
import MyA3s from "./pages/A3/MyA3s";

// 🧭 5S
import FiveSIntro from "./pages/5S/5sIntro";
import FiveSProyectos from "./pages/5S/5sProyectos";
import FiveSImplementacion from "./pages/5S/5sImplementacion";
import FiveSSeguimiento from "./pages/5S/5sSeguimiento";
import FiveSAuditoria from "./pages/5S/5sAuditoria";

// 🚶 Gemba Walk
import GembaIntro from "./pages/GembaWalk/GwIntro";
import GembaEjecucion from "./pages/GembaWalk/GwEjecucion";
import GembaReporte from "./pages/GembaWalk/GwReporte";

// 🗺️ VSM
import VsmIntro from "./pages/VSM/VsmIntro";
import Vsm from "./pages/VSM/Vsm";
import VsmBuilder from "./pages/VSM/VsmBuilder";

// ⚙️ SIPOC
import SipocIntro from "./pages/SIPOC/SipocIntro";
import SipocBuilder from "./pages/SIPOC/SipocBuilder";
import SipocResumen from "./pages/SIPOC/SipocResumen";

// 📊 KPIs / OEE / OOE / TEEP
import KpiDashboard from "./pages/KPI/KpiDashboard";
import OeeIntro from "./pages/OEE/OeeIntro";
import OeeBuilder from "./pages/OEE/OeeBuilder";
import OeeAnalysis from "./pages/OEE/OeeAnalysis";
import OeeDashboard from "./pages/OEE/OeeDashboard";
import OoeIntro from "./pages/OOE/OoeIntro";
import OoeBuilder from "./pages/OOE/OoeBuilder";
import OoeDashboard from "./pages/OOE/OoeDashboard";
import TeepIntro from "./pages/TEEP/TeepIntro";
import TeepBuilder from "./pages/TEEP/TeepBuilder";
import TeepDashboard from "./pages/TEEP/TeepDashboard";

function App() {
  return (
    <Routes>
      {/* 🌍 Páginas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

        {/* 👔 Administración */}
        <Route path="/admin/empresas" element={<Empresas />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/roles" element={<Roles />} />

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
    <ProtectedRoute allowedRoles={["SuperAdmin"]}>
      <Consultas />
    </ProtectedRoute>
  }
/>




        {/* 📘 A3 */}
        <Route path="/create-a3" element={<CreateA3 />} />
        <Route path="/my-a3s" element={<MyA3s />} />

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
    </Routes>
  );
}

export default App;
