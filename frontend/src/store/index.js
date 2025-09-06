import { create } from 'zustand';
import { setAuthToken } from '../libs/apiCall';
import { jwtDecode } from 'jwt-decode';

const useStore = create((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  initializeStore: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedToken || storedToken === "undefined") {
      // Silently clear invalid tokens without logging
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthToken(null);
      set({ user: null, token: null, isInitialized: true });
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);

      // ✅ Check if the token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("⚠️ Token expired. Logging out...");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setAuthToken(null);
        set({ user: null, token: null, isInitialized: true });
      } else {
        set({ user: JSON.parse(storedUser), token: storedToken, isInitialized: true });
        setAuthToken(storedToken); // ✅ Ensure Axios has the token
      }
    } catch (error) {
      console.error("🚨 Error decoding token:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthToken(null);
      set({ user: null, token: null, isInitialized: true });
    }
  },

  setCredentials: (userData) => {
    if (!userData?.token) {
      console.error("🚨 No token received in setCredentials");
      return;
    }

    set({ user: userData, token: userData.token });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setAuthToken(userData.token); // ✅ Ensure token is set globally
  },

  updateUser: (userData) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentToken = localStorage.getItem("token");
    
    const updatedUser = { ...userData, token: currentToken };
    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
  },

  logout: () => {
    console.warn("User logged out manually.");
    set({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
  },
}));

export default useStore;
