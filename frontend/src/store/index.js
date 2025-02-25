import { create } from 'zustand';
import { setAuthToken } from '../libs/apiCall';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  setCredentials: (userData) => {
    set({ user: userData, token: userData?.token });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setAuthToken(userData.token); // ✅ Set token in axios
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null); // ✅ Clear axios token
  }
}));

export default useStore;
