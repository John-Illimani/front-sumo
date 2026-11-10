const API_URL = import.meta.env.VITE_API_URL + "/api"

export const authService = {
  // Iniciar Sesión
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error al iniciar sesión');
    }

    // Guardar JWT y datos del usuario en LocalStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.usuario));

    return data;
  },

  // Cerrar Sesión
  logout: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error al revocar token:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // Obtener usuario autenticado
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};