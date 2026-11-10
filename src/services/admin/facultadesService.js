const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const facultadesService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/facultades`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener facultades');
    return data
  },

  create: async (facultadesData) => {
    const response = await fetch(`${API_URL}/facultades`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...facultadesData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar facultades');
    return data;
  },

  update: async (id, facultadesData) => {
    const response = await fetch(`${API_URL}/facultades/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(facultadesData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar facultades');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/facultades/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar facultades');
    return data;
  }
};