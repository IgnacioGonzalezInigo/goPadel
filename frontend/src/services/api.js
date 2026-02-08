const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    },
    };

    // Eliminamos el try/catch innecesario
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Es importante parsear el JSON antes de checkear response.ok 
    // para obtener el mensaje de error del servidor
    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
    }

    return data;
}

// Métodos HTTP
export const api = {
    // GET
    get: (endpoint) => {
    return request(endpoint, { method: 'GET' });
    },

    // POST
    post: (endpoint, body) => {
    return request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    },

    // PUT
    put: (endpoint, body) => {
    return request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    },

    // DELETE
    delete: (endpoint) => {
    return request(endpoint, {
        method: 'DELETE',
    });
    },
};

// Servicios específicos de autenticación
export const authService = {
    login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    return data;
    },

    logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    },

    getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};