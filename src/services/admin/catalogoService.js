const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const catalogoService = {
  // Carga global para los select del formulario
  getAll: async () => {
    const response = await fetch(`${API_URL}/catalogos/todos`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener catálogos');
    return data;
  },

  // 1. Turnos
  getTurnos: async () => {
    const response = await fetch(`${API_URL}/catalogos/turnos`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener turnos');
    return data;
  },

  createTurno: async (turnoData) => {
    const response = await fetch(`${API_URL}/catalogos/turnos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(turnoData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar turno');
    return data;
  },

  // 2. Estados de Inscripción
  getEstadosInscripcion: async () => {
    const response = await fetch(`${API_URL}/catalogos/estados-inscripcion`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener estados de inscripción');
    return data;
  },

  createEstadoInscripcion: async (estadoData) => {
    const response = await fetch(`${API_URL}/catalogos/estados-inscripcion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(estadoData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar estado de inscripción');
    return data;
  },

  // 3. Medios de Pago
  getMediosPago: async () => {
    const response = await fetch(`${API_URL}/catalogos/medios-pago`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener medios de pago');
    return data;
  },

  createMedioPago: async (medioData) => {
    const response = await fetch(`${API_URL}/catalogos/medios-pago`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(medioData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar medio de pago');
    return data;
  },

  // 4. Estados de Pago
  getEstadosPago: async () => {
    const response = await fetch(`${API_URL}/catalogos/estados-pago`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener estados de pago');
    return data;
  },

  createEstadoPago: async (estadoPagoData) => {
    const response = await fetch(`${API_URL}/catalogos/estados-pago`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(estadoPagoData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al registrar estado de pago');
    return data;
  }
};