import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const handleLogin = async (username, password, setAlert) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      setAlert({ message: 'Login successful!', type: 'success' });
      return true; // ✅ Login successful
    } else {
      setAlert({ message: 'Invalid username or password.', type: 'danger' });
      return false;
    }
  } catch (error) {
    setAlert({ message: 'Something went wrong. Please try again.', type: 'danger' });
    return false;
  }
};

