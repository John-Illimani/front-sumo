const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const docentesService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/docentes`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener docentes');
    return data
  },

  create: async (docentesData) => {
    const response = await fetch(`${API_URL}/docentes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...docentesData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar docentes');
    return data;
  },

  update: async (id, docentesData) => {
    const response = await fetch(`${API_URL}/docentes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(docentesData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar docentes');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/docentes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar docentes');
    return data;
  }
};