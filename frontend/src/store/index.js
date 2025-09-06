import { create } from 'zustand';
import { setAuthToken } from '../libs/apiCall';
import { jwtDecode } from 'jwt-decode';

const useStore = create((set) => ({
  user: null,
  token: null,

  initializeStore: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedToken || storedToken === "undefined") {
      console.warn("⚠️ No valid token found. Logging out...");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthToken(null);
      set({ user: null, token: null });
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
        set({ user: null, token: null });
      } else {
        set({ user: JSON.parse(storedUser), token: storedToken });
        setAuthToken(storedToken); // ✅ Ensure Axios has the token
      }
    } catch (error) {
      console.error("🚨 Error decoding token:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthToken(null);
      set({ user: null, token: null });
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

  logout: () => {
    console.warn("User logged out manually.");
    set({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
  },
}));

export default useStore;
