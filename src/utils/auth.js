const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true'); // Set a flag for client-side routing
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  window.dispatchEvent(new Event('storage'));
};

export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const getToken = () => {
  return localStorage.getItem('token');
};