import React from "react";
import {
  LayoutDashboard,
  User,
  PlusCircle,
  BookOpenCheck,
  CalendarCheck2,
  Receipt,
  FileCheck2,
  Download,
} from "lucide-react";
import { InstitutionalNavbar } from "../navbar_layout";

const MENU_ITEMS_ESTUDIANTE = [
  {
    name: "Mi Portal",
    link: "/estudiante/info",
    icon: LayoutDashboard,
  },

  {
    name: "Inscribirse / Tomar Materias",
    link: "/estudiante/inscribirse",
    icon: PlusCircle,
  },

  {
    name: "Mis Cursos y Horarios",
    link: "/estudiante/cursos-horarios",
    icon: BookOpenCheck,
  },

  {
    name: "Actualizar mis Datos",
    link: "/estudiante/update",
    icon: Download,
  },
];

export const SidebarEstudiante = () => {
  return (
    <InstitutionalNavbar
      menuItems={MENU_ITEMS_ESTUDIANTE}
      roleTitle="Portal del Estudiante"
    />
  );
};
