"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
      <header className="w-full border-b border-light-600/20 bg-dark-100/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center bg-success-100 rounded-full w-10 h-10 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.svg" 
                alt="Chucky InterviewPrep Logo" 
                width={24} 
                height={24}
                className="filter brightness-0 invert"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chucky</h2>
              <p className="text-xs text-success-100 font-semibold">InterviewPrep</p>
            </div>
          </Link>

          {/* Navigation & Logout */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/interview" 
                className="text-light-100 hover:text-success-100 transition-colors font-semibold"
              >
                Create Interview
              </Link>
            </nav>
            
            <Button 
              onClick={handleLogout}
              className="btn-secondary border border-success-100/20 hover:border-success-100/40"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;