import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Si no hay token o sesión, redirigir al login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Si la ruta requiere roles específicos y el usuario no lo tiene
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir según el rol que realmente tiene
    if (user.rol === 'administrador') return <Navigate to="/admin/info" replace />;
    if (user.rol === 'secretaria') return <Navigate to="/secretaria/info" replace />;
    if (user.rol === 'postulante') return <Navigate to="/estudiante/info" replace />;
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderiza las rutas hijas
  return <Outlet />;
};