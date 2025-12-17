"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc"; 

import { auth } from "@/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signIn } from "@/lib/actions/auth.action";

/**
 * Standalone button component for Google Sign-In.
 * Can be used in both sign-up and sign-in forms.
 */
const GoogleSignInButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // 1. Create Google Auth Provider instance
      const provider = new GoogleAuthProvider();
      // (Optional) Add additional scopes if needed, e.g., provider.addScope('profile');

      // 2. Trigger sign-in with popup using Firebase Auth
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 3. Get the Google ID token
      const idToken = await user.getIdToken();
      if (!idToken) {
        throw new Error("Failed to retrieve ID token from Google.");
      }

      // 4. Call your server action to create a session
      // This matches the flow in your existing email signIn action
      await signIn({
        email: user.email!,
        idToken: idToken,
      });

      // 5. Success
      toast.success(`Welcome ${user.displayName || user.email}!`);
      router.push("/"); // Redirect to home page
      router.refresh(); // Refresh server components if needed

    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // User-friendly error messages
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info("Sign-in window was closed.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error("An account already exists with this email. Please try signing in with your email and password.");
      } else {
        toast.error(`Sign-in failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button" // Important: prevent form submission
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-dark-300 hover:bg-dark-400 border border-light-600/30 rounded-2xl text-light-100 font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="h-5 w-5 border-2 border-light-400 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;