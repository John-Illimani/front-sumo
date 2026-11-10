import React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  School,
  Layers,
  UserCog,
  FileCheck2,
  BarChart3,
  ListChecks,
} from "lucide-react";
import { InstitutionalNavbar } from "../navbar_layout";


const MENU_ITEMS_ADMIN = [
  { name: "Inicio", link: "/admin/info", icon: LayoutDashboard },
  { name: "Gestión de Administradores", link: "/admin/manager-admin", icon: ShieldCheck },
  { name: "Gestión de Estudiantes", link: "/admin/manager-students", icon: GraduationCap },
  { name: "Gestión de Secretarias", link: "/admin/manager-secre", icon: UserCog },
  { name: "Gestión de Docentes", link: "/admin/manager-docentes", icon: UserCog },
  { name: "Gestión de Cursos", link: "/admin/manager-cursos", icon: School },
  { name: "Gestión de Facultades", link: "/admin/manager-facultades", icon: Layers },
  { name: "Verificar Boleta y RFID", link: "/admin/verify-boleta", icon: FileCheck2 },
  { name: "Reportes", link: "/admin/reports", icon: BarChart3 },
  { name: "Certificados", link: "/admin/generate-certificados", icon: ListChecks },
];

export const SidebarAdmin = () => {
  return (
    <InstitutionalNavbar
      menuItems={MENU_ITEMS_ADMIN}
      roleTitle="Panel Administrativo"
    />
  );
};