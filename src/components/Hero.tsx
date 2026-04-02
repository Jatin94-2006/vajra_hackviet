"use client";

import { motion } from "framer-motion";
import { ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background ambient lights */}
      <div className="ambient-light bg-primary/20 w-[600px] h-[600px] top-[10%] left-[20%]"></div>
      <div className="ambient-light bg-primary-dark/20 w-[500px] h-[500px] bottom-[10%] right-[10%]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono"
        >
          <Terminal className="w-4 h-4" />
          <span>v2.0 AI Engine Online</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Autonomous AI <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
            Security Engineer
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Vajra scans, identifies, and automatically remediates vulnerabilities in your codebase without human intervention. Secure your software delivery instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 bg-primary text-slate-950 font-bold rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            Try Vajra Dashboard <ChevronRight className="w-5 h-5" />
          </Link>
          <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-all">
            View Documentation
          </button>
        </motion.div>
      </div>
    </section>
  );
}
