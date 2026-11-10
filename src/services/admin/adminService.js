const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const adminService = {
  // Obtener usuarios con rol administrador
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener administradores');
    return data.filter(u => u.rol === 'administrador');
  },

  // Crear nuevo administrador
  create: async (adminData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear administrador');
    return data;
  },

  // Actualizar administrador existente
  update: async (id, adminData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar administrador');
    return data;
  },

  // Eliminar / revocar administrador
  delete: async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar administrador');
    return data;
  }
};