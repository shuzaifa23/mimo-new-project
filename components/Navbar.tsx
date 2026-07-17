"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Printer, LayoutDashboard, Home, PlusCircle, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/core";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("student_phone");
    router.push("/");
    router.refresh();
  };
  
  const isSpecialPath = pathname?.startsWith('/admin') || 
                        pathname?.startsWith('/vendor') || 
                        pathname?.startsWith('/vendor-login') || 
                        pathname?.startsWith('/dashboard') ||
                        pathname?.startsWith('/student/login');

  if (isSpecialPath) return null;
  
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/upload" className="flex items-center gap-0 mr-4 md:mr-8 transition-transform hover:scale-105 active:scale-95">
          <img src="/mimo-x-light.png" alt="MIMO X Logo" className="w-40 md:w-56 h-12 md:h-14 object-cover object-center block dark:hidden" />
          <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="w-40 md:w-56 h-12 md:h-14 object-cover object-center hidden dark:block" />
        </Link>

        {/* Desktop Links */}
        {pathname !== '/' && (
          <div className="hidden items-center gap-8 md:flex">
            <Link 
              href="/upload" 
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${pathname === '/upload' ? 'text-[#2DBDD5]' : 'text-zinc-500 hover:text-[#2DBDD5]'}`}
            >
              <Home size={16} />
              <span>Home</span>
            </Link>

            <Link 
              href="/student/track" 
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${pathname === '/student/track' ? 'text-[#2DBDD5]' : 'text-zinc-500 hover:text-[#2DBDD5]'}`}
            >
              <LayoutDashboard size={16} />
              <span>Track Order</span>
            </Link>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {pathname !== '/' && (
            <>
              {pathname !== '/upload' && pathname !== '/student/order' && pathname !== '/student/track' && (
                <Link href="/student/order" className="hidden sm:block">
                  <Button size="sm" className="h-9 px-4 rounded-full font-bold shadow-md shadow-[#2DBDD5]/20 bg-gradient-to-r from-[#2DBDD5] to-[#2553B5] hover:from-[#66DFC0] hover:to-[#2DBDD5] border-0 text-white">
                    Print Now
                  </Button>
                </Link>
              )}

              {user && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex h-9 px-4 rounded-full font-bold border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  Log Out
                </Button>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 md:hidden dark:bg-zinc-900 dark:text-zinc-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && pathname !== '/' && (
        <div className="border-t border-zinc-100 bg-white p-6 md:hidden dark:border-zinc-800 dark:bg-zinc-950 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <Link 
              href="/upload" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${pathname === '/upload' ? 'bg-[#2DBDD5]/10 text-[#2DBDD5] dark:bg-[#2DBDD5]/20' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link 
              href="/student/track" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${pathname === '/student/track' ? 'bg-[#2DBDD5]/10 text-[#2DBDD5] dark:bg-[#2DBDD5]/20' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              <LayoutDashboard size={20} />
              <span>Track Order</span>
            </Link>
            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 text-left w-full cursor-pointer"
              >
                <LogOut size={20} />
                <span>Log Out ({user.email})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
