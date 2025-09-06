import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: API_URL,
});

// ✅ Function to Set Auth Token Globally
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ Load token from localStorage on app start
const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

export default api;
