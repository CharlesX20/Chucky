"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import PasswordField from "./PasswordField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("🎉 Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("❌ Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("🚀 Signed in successfully.");
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error("📧 This email is already registered. Please sign in.");
      } else if (error.code === 'auth/invalid-credential') {
        toast.error("❌ Invalid email or password. Please try again.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("🔒 Password should be at least 6 characters.");
      } else {
        toast.error(`💥 There was an error: ${error.message}`);
      }
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-dark-100">
      <div className="card-border lg:min-w-[480px] w-full max-w-md">
        <div className="flex flex-col gap-6 card py-12 px-8 sm:px-10">
          {/* Logo & Brand */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center bg-success-100 rounded-full w-16 h-16">
                <Image src="/logo.svg" alt="logo" height={28} width={32} className="filter brightness-0 invert" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Chucky InterviewPrep</h2>
            <p className="text-light-100 text-lg">
              {isSignIn ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          {/* Form Title */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {isSignIn ? "Sign In to Your Account" : "Start Your Interview Journey"}
            </h3>
            <p className="text-light-400 text-sm">
              {isSignIn 
                ? "Enter your credentials to access your interviews" 
                : "Fill in your details to create personalized interviews"
              }
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-5 mt-2"
            >
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                />
              )}

              <FormField
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="your.email@example.com"
                type="email"
              />

              {/* Updated Password Field with Toggle */}
              <PasswordField
                control={form.control}
                name="password"
                label="Password"
                placeholder={isSignIn ? "Enter your password" : "Create a strong password"}
              />

              <Button 
                className="btn w-full mt-6 py-3 text-lg font-semibold" 
                type="submit"
              >
                {isSignIn ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Account
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {/* Switch Auth Type */}
          <div className="text-center pt-4 border-t border-light-600/20">
            <p className="text-light-100">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <Link
                href={!isSignIn ? "/sign-in" : "/sign-up"}
                className="font-bold text-success-100 hover:text-success-200 ml-2 transition-colors duration-200"
              >
                {!isSignIn ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-light-400">
              🔒 Your data is securely encrypted and protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;