const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const pagosService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/pagos`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener pagos');
    return data;
  },

  create: async (pagosData) => {
    const response = await fetch(`${API_URL}/pagos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...pagosData, rol: 'postulante' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar pagos');
    return data;
  },

  update: async (id, pagosData) => {
    const response = await fetch(`${API_URL}/pagos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pagosData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar pagos');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/pagos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar pagos');
    return data;
  }
};