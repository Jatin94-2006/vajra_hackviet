"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const activeUser = localStorage.getItem("vajra_logged_in");
    if (activeUser === "true") {
      setIsLoggedIn(true);
      setUserEmail("demo.user@gmail.com");
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("vajra_logged_in", "true");
    setIsLoggedIn(true);
    setUserEmail("demo.user@gmail.com");
    window.location.reload(); 
  };

  const handleLogout = () => {
    localStorage.removeItem("vajra_logged_in");
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.reload();
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-card-border/50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">VAJRA</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</Link>
          <Link href="#workflow" className="text-sm text-slate-300 hover:text-white transition-colors">Workflow</Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 py-1.5 px-4 rounded-full">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-6 h-6 bg-primary/20 flex items-center justify-center rounded-full">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                {userEmail}
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors pointer-cursor"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-5 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/30 rounded-full hover:bg-primary/20 hover:border-primary transition-all flex items-center gap-2"
            >
              Sign in with Google
            </button>
          )}

          <Link href="/dashboard" className="px-5 py-2 text-sm font-medium bg-primary/20 text-primary border border-primary/50 rounded-full hover:bg-primary/30 transition-all">
            Open Dashboard
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
