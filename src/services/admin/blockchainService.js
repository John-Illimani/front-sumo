const API_URL = import.meta.env.VITE_API_URL + "/api/blockchain";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const blockchainService = {
  /**
   * Envía los datos identitarios y el texto dinámico para certificar en Blockchain y BD.
   *
   * @param {Object} data
   * @param {number} data.postulanteId ID del postulante en la BD sumo
   * @param {string} data.nombreCompleto Nombre completo del estudiante
   * @param {string} data.ci Documento de identidad
   * @param {string} data.facultad Nombre de la facultad
   * @param {string} data.curso Nombre del programa o curso
   * @param {string} [data.textoCertificado] Texto complementario (horas, fechas, notas)
   * @returns {Promise<Object>} Respuesta del servidor con el hashBoletin y txHash
   */
  async certificar(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/certificar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postulanteId: data.postulanteId,
          nombreCompleto: data.nombreCompleto,
          ci: data.ci,
          facultad: data.facultad,
          curso: data.curso,
          textoCertificado: data.textoCertificado || "",
        }),
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada o no autorizada. Vuelve a iniciar sesión.");
      }

      let result;
      try {
        result = await response.json();
      } catch (_) {
        throw new Error(`Error en el servidor (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Error al certificar en Blockchain.");
      }

      return result;
    } catch (error) {
      console.error("Error en blockchainService.certificar:", error);
      throw error;
    }
  },

  /**
   * Consulta la validez de un certificado por su Hash (usado en la verificación del QR o búsqueda manual).
   *
   * @param {string} hash Hash determinista SHA-256 (0x...) o TX Hash
   * @returns {Promise<Object>} Datos del certificado en la BD local y en la Blockchain
   */
  async verificar(hash) {
    try {
      // 1. Validar que el parámetro exista antes de hacer el fetch
      if (!hash) {
        throw new Error("El parámetro hash es requerido para verificar.");
      }

      // 2. Se envía '?hash=' para alinearse con BlockchainController@verificar en Laravel
      const response = await fetch(
        `${API_BASE_URL}/verificar?hash=${encodeURIComponent(hash)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        throw new Error("Sesión expirada o no autorizada. Vuelve a iniciar sesión.");
      }

      let result;
      try {
        result = await response.json();
      } catch (_) {
        throw new Error(`Error en el servidor (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        // 3. Extracción limpia de la respuesta JSON que retorna Laravel (404 / 422 / 500)
        const errorMessage =
          result.message ||
          result.error ||
          "El Hash de Transacción o Documento no coincide con ningún certificado válido en el sistema o Blockchain.";

        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error("Error en blockchainService.verificar:", error);
      throw error;
    }
  },
};