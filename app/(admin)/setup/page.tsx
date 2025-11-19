"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { setupAdminUser } from "@/lib/setupAdmin";

const SetupAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const result = await setupAdminUser(user.uid);
      
      if (result.success) {
        toast.success("🎉 You are now an admin! Refresh the page to see admin features.");
        router.push("/");
      } else {
        toast.error("❌ Failed to setup admin: " + result.error);
      }
    } catch (error) {
      toast.error("💥 An error occurred during setup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100">
      <div className="card-border max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-warning-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Admin Setup</h1>
          <p className="text-light-100 mb-6">
            This will grant you administrative privileges to manage all interviews and users in the system.
          </p>
          
          <Button
            onClick={handleSetupAdmin}
            disabled={isLoading}
            className="btn-warning w-full"
          >
            {isLoading ? "Setting up Admin..." : "Make Me Admin"}
          </Button>
          
          <p className="text-light-400 text-sm mt-4">
            ⚠️ Only run this if you are the system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupAdminPage;