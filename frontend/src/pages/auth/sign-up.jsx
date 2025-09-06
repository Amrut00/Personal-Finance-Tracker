import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import * as z from "zod";
import useStore from '../../store';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import Input from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { BiLoader } from "react-icons/bi";
import { toast } from "sonner";
import api, { setAuthToken } from '../../libs/apiCall';

const RegisterSchema = z.object({
  firstname: z.string({ required_error: "First name is required" }).min(2, "First name is required"),
  lastname: z.string({ required_error: "Last name is required" }).min(2, "Last name is required"),
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
  password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters"),
});

const SignUp = () => {
  const { user, setCredentials } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user && navigate("/");
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const { data: res } = await api.post("/auth/sign-up", data);

      if (res?.status === "success") {
        // Store the credentials in the store
        setCredentials({ ...res.user, token: res.token });
        
        toast.success("Account created successfully. Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/overview");
        }, 1000);
      } else {
        toast.error(res?.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage = error?.response?.data?.message;
      if (errorMessage === "User already exists.") {
        toast.error("Email already registered. Please try logging in instead.");
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center w-full min-h-screen py-10'>
      <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
        <div className='p-6 md:p-8'>
          <CardHeader className='py-0'>
            <CardTitle className='mb-8 text-center dark:text-white'>
              Create Account
            </CardTitle>
          </CardHeader>

          <CardContent className='p-0'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Input
                disabled={loading}
                id="firstname"
                label="First Name"
                placeholder="John"
                error={errors?.firstname?.message}
                {...register("firstname")}
              />

              <Input
                disabled={loading}
                id="lastname"
                label="Last Name"
                placeholder="Doe"
                error={errors?.lastname?.message}
                {...register("lastname")}
              />

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

              <Button type='submit' className="w-full bg-violet-800" disabled={loading}>
                {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : "Create an account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <p className='text-sm text-gray-600'>Already have an account?</p>
            <Link to="/sign-in" className='text-sm font-semibold text-violet-600 hover:underline'>
              Sign in
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
