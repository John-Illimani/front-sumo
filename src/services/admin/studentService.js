


const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const studentService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener estudiantes');
    return data.filter(u => u.rol === 'postulante');
  },

  create: async (studentData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...studentData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar estudiante');
    return data;
  },

  update: async (id, studentData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar estudiante');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar estudiante');
    return data;
  }
};