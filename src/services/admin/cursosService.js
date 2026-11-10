const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const cursosService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/cursos`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener cursos');
    return data
  },

  create: async (cursosData) => {
    const response = await fetch(`${API_URL}/cursos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...cursosData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar cursos');
    return data;
  },

  update: async (id, cursosData) => {
    const response = await fetch(`${API_URL}/cursos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cursosData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar cursos');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/cursos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar cursos');
    return data;
  }
};