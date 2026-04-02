"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="ambient-light bg-primary/20 w-[600px] h-[600px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass p-12 md:p-16 rounded-3xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to secure your codebase?</h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join the future of DevSecOps. Deploy Vajra today and let autonomous AI handle your security workload.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-primary text-slate-950 font-bold rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              Request Early Access
            </button>
            <button className="px-8 py-4 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-all border border-slate-700">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
