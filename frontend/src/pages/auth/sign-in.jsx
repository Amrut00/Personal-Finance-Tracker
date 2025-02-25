import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import * as z from "zod";
import useStore from '../../store';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import Input from "../../components/ui/input";
import { Button } from '../../components/ui/button';
import { BiLoader } from "react-icons/bi";
import { toast } from "sonner";
import api, { setAuthToken } from '../../libs/apiCall';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginSchema = z.object({
  email: z.string().email("Invalid email address").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

const SignIn = () => {
  const { user, setCredentials } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user && navigate("/overview");
  }, [user, navigate]);

  // ➤ Traditional Sign-In
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { data: res } = await api.post("/auth/sign-in", data);

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user)); // ✅ Saves user data
        localStorage.setItem("token", res.token);               // ✅ Save JWT token
        setCredentials(res.user);                               
        setAuthToken(res.token);                               
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.error("No user data received");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error?.response?.data?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ➤ Google Sign-In Handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);

      const { data: res } = await api.post("/auth/google", { token: credential });

      if (res?.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        setCredentials(res.user);
        setAuthToken(res.token);
        toast.success("Logged in with Google!");
        navigate("/dashboard");
      } else {
        toast.error("Google login failed");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className='flex items-center justify-center w-full min-h-screen py-10'>
      <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
        <div className='p-6 md:p-8'>
          <CardHeader className='py-0'>
            <CardTitle className='mb-8 text-center dark:text-white'>
              Login
            </CardTitle>
          </CardHeader>

          <CardContent className='p-0'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Input
                disabled={loading}
                id="email"
                label="Email"
                type="email"
                placeholder="johndoe@example.com"
                error={errors?.email?.message}
                {...register("email")}
              />

              <Input
                disabled={loading}
                id="password"
                label="Password"
                type="password"
                placeholder="Your password"
                error={errors?.password?.message}
                {...register("password")}
              />

              <Button
                type='submit'
                className="w-full bg-violet-800"
                disabled={loading}
              >
                {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : "Login"}
              </Button>
            </form>

            <div className='my-4 text-center text-gray-600'>OR</div>

            {/* ➤ Google Login Component */}
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google Login Failed")}
              width="100%"
              theme="filled_blue"
              text="signin_with"
              shape="rectangular"
            />
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <p className='text-sm text-gray-600'>Don't have an account?</p>
            <Link to="/sign-up" className='text-sm font-semibold text-violet-600 hover:underline'>
              Sign up
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
