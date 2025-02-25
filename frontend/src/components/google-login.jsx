import { GoogleLogin, googleLogout } from '@react-oauth/google';
import jwt_decode from "jwt-decode";
import { toast } from 'sonner';
import api from '../libs/apiCall';
import useStore from '../store';

const GoogleLoginComponent = () => {
  const { setUser } = useStore((state) => state);

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      
      // Send to backend for verification or user creation
      const { data: res } = await api.post('/auth/google', {
        google_uid: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      });

      if (res?.status === 'success') {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success("Logged in successfully");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Google Sign-In failed");
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        onSuccess={handleSuccess}
        onError={() => toast.error("Login Failed")}
      />
    </div>
  );
};

export default GoogleLoginComponent;
