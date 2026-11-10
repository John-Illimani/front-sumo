import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";

import { SumoLandingLogin } from "../pages/auth/login";
import { Estudiantes } from "../pages/admin/manager_students";
import { Cursos } from "../pages/admin/manager_cursos";
import { Facultades } from "../pages/admin/manager_facultades";
import { VerificarBoleta } from "../pages/admin/verify_boleta";
import { ReportesPDF } from "../pages/admin/manager_reports";
import { ListasPorAreaPDF } from "../pages/admin/manager_list_students";
import { Secretarias } from "../pages/admin/manager_secretarias";
import { Administradores } from "../pages/admin/manager_admin";
import { DashboardInicio } from "../pages/admin/info_admin";
import { SidebarAdmin } from "../components/layout/navbars/navbar_admin";
import { SidebarSecretaria } from "../components/layout/navbars/navbar_secretaria";
import { EstudiantesSecretaria } from "../pages/secretaria/manager_students";
import { ConsultaCursosSecretaria } from "../pages/secretaria/consulta_cursos";
import { VerificarBoletaSecretaria } from "../pages/secretaria/verify_boleta";
import { ListasPorAreaSecretaria } from "../pages/secretaria/list_area";
import { ReportesGeneralesSecretaria } from "../pages/secretaria/reports";
import { DashboardSecretaria } from "../pages/secretaria/secre_info";
import { SidebarEstudiante } from "../components/layout/navbars/navbar_student";
import { TomaMateriasEstudiante } from "../pages/student/inscripcion";
import { MisCursosYHorarios } from "../pages/student/cursos_horarios";
import { MisPagosYBoletas } from "../pages/student/pagos_boletas";

import { DashboardInicioEstudiante } from "../pages/student/student_info";
import { GeneradorCertificados } from "../pages/admin/generate_certificados";
import { VerificacionRfidAdmin } from "../pages/admin/verify_rfid";
import { VerificacionRfidSecretaria } from "../pages/secretaria/verify_rfid";
import { Docentes } from "../pages/admin/manager_docentes";
import { RegistroPostulanteInicio } from "../pages/student/RegistroPostulanteInicio";
import { ActualizarPerfilEstudiante } from "../pages/student/ActualizarPerfilEstudiante";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<SumoLandingLogin />} />
        <Route path="/registrate" element={<RegistroPostulanteInicio />} />


        {/* --- RUTAS PROTEGIDAS: ADMINISTRADOR --- */}
        <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
          <Route path="/admin" element={<SidebarAdmin />}>
            <Route index element={<DashboardInicio />} />
            <Route path="info" element={<DashboardInicio />} />
            <Route path="manager-admin" element={<Administradores />} />
            <Route path="manager-students" element={<Estudiantes />} />
            <Route path="manager-cursos" element={<Cursos />} />
            <Route path="manager-facultades" element={<Facultades />} />
            <Route path="verify-boleta" element={<VerificarBoleta />} />
            <Route path="reports" element={<ReportesPDF />} />
            <Route path="reports-list" element={<ListasPorAreaPDF />} />
            <Route path="manager-secre" element={<Secretarias />} />
            <Route path="generate-certificados" element={<GeneradorCertificados />} />
            <Route path="verify-rfid" element={<VerificacionRfidAdmin />} />
            <Route path="manager-docentes" element={<Docentes />} />
          </Route>
        </Route>

        {/* --- RUTAS PROTEGIDAS: SECRETARÍA --- */}
        <Route element={<ProtectedRoute allowedRoles={['secretaria']} />}>
          <Route path="/secretaria" element={<SidebarSecretaria />}>
            <Route index element={<DashboardSecretaria />} />
            <Route path="info" element={<DashboardSecretaria />} />
            <Route path="manager-students" element={<EstudiantesSecretaria />} />
            <Route path="manager-cursos" element={<ConsultaCursosSecretaria />} />
            <Route path="verify-boleta" element={<VerificarBoletaSecretaria />} />
            <Route path="reports-list" element={<ListasPorAreaSecretaria />} />
            <Route path="reports" element={<ReportesGeneralesSecretaria />} />
            <Route path="verify-rfid" element={<VerificacionRfidSecretaria />} />
          </Route>
        </Route>

        {/* --- RUTAS PROTEGIDAS: ESTUDIANTE / POSTULANTE --- */}
        <Route element={<ProtectedRoute allowedRoles={['postulante']} />}>
          <Route path="/estudiante" element={<SidebarEstudiante />}>
            <Route index element={<DashboardInicioEstudiante />} />
            <Route path="info" element={<DashboardInicioEstudiante />} />
            <Route path="inscribirse" element={<TomaMateriasEstudiante />} />
            <Route path="cursos-horarios" element={<MisCursosYHorarios />} />
            <Route path="pagos" element={<MisPagosYBoletas />} />
            <Route path="update" element={<ActualizarPerfilEstudiante />} />
          </Route>
        </Route>

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<SumoLandingLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;