const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const inscripcionesService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/inscripciones`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener inscripciones');
    return data;
  },

  create: async (inscripcionesData) => {
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...inscripcionesData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar inscripciones');
    return data;
  },

  update: async (id, inscripcionesData) => {
    const response = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(inscripcionesData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar inscripciones');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar inscripciones');
    return data;
  },
  // Nueva función para eliminar por postulante_id
  cancelarInscripcionesPorPostulante: async (postulanteId) => {
    const response = await fetch(`${API_URL}/postulantes/${postulanteId}/cancelar-inscripciones`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al cancelar inscripciones del postulante');
    return data;
  }
};