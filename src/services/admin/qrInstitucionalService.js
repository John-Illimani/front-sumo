const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const qrInstitucionalService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/qr-institucional`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener QRs institucionales');
    return data.data || [];
  },

  getActivo: async () => {
    const response = await fetch(`${API_URL}/qr-institucional/activo`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener QR activo');
    return data.qr || null;
  },

  create: async (formData) => {
    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${API_URL}/qr-institucional`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Detalle del error Backend:", data); 
      throw new Error(data.error || data.message || 'Error al guardar QR institucional');
    }
    return data;
  },

  update: async (id, formData) => {
    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    if (!formData.has('_method')) {
      formData.append('_method', 'PUT');
    }

    const response = await fetch(`${API_URL}/qr-institucional/${id}`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error("Detalle del error Backend:", data);
      throw new Error(data.message || 'Error al actualizar QR institucional');
    }
    return data;
  },

  activar: async (id) => {
    const response = await fetch(`${API_URL}/qr-institucional/${id}/activar`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al cambiar estado del QR');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/qr-institucional/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar el registro');
    return data;
  }
};