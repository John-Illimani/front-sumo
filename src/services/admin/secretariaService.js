const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const secretariaService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener secretarias');
    // Filtramos solo los usuarios que tienen rol secretaria y su relación cargada
    return data.filter(u => u.rol === 'secretaria');
  },

  create: async (secretariaData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...secretariaData, rol: 'secretaria' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar secretaria');
    return data;
  },

  update: async (id, secretariaData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(secretariaData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar secretaria');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar secretaria');
    return data;
  }
};