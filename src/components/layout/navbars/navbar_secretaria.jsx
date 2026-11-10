import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  School,
  FileCheck2,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { InstitutionalNavbar } from "../navbar_layout";

const MENU_ITEMS_SECRETARIA = [
  {
    name: "Inicio",
    link: "/secretaria/info",
    icon: LayoutDashboard,
  },

  {
    name: "Gestión de Estudiantes",
    link: "/secretaria/manager-students",
    icon: GraduationCap,
  },
  {
    name: "Consulta de Cursos",
    link: "/secretaria/manager-cursos",
    icon: School,
  },

  {
    name: "Verificar Boleta y RFID",
    link: "/secretaria/verify-boleta",
    icon: FileCheck2,
  },

  {
    name: "Listas por Área",
    link: "/secretaria/reports-list",
    icon: ListChecks,
  },
  {
    name: "Reportes",
    link: "/secretaria/reports",
    icon: BarChart3,
  },
];

export const SidebarSecretaria = () => {
  return (
    <InstitutionalNavbar
      menuItems={MENU_ITEMS_SECRETARIA}
      roleTitle="Panel de Secretaría"
    />
  );
};
