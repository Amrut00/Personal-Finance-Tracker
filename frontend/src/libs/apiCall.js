import axios from 'axios';

const API_URL =  "https://fj-be-r2-amrut-pathane-iiit-pune-1.onrender.com/api-v1";

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

// ✅ Check localStorage on first load
const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

export default api;
