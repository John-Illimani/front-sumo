const API_URL = import.meta.env.VITE_API_URL + "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const blockchainBoletaService = {
  /**
   * Certifica y registra una boleta de pago en la Blockchain.
   * @param {Object} boletaData Datos de la boleta (postulanteId, nombreCompleto, ci, reciboNro, montoAbonado, etc.)
   */
  certificar: async (boletaData) => {
    const response = await fetch(`${API_URL}/blockchain/boletas/certificar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(boletaData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al certificar la boleta en Blockchain');
    return data;
  },

  /**
   * Verifica la autenticidad de una boleta por medio de su Hash en Blockchain.
   * @param {string} hash Hash SHA-256 o hashBoletin de la boleta
   */
  verificar: async (hash) => {
    const response = await fetch(`${API_URL}/blockchain/boletas/verificar?hash=${encodeURIComponent(hash)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al verificar la boleta en Blockchain');
    return data;
  }
};

