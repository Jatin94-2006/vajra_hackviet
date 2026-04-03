"use client";

import { motion } from "framer-motion";
import { FileCode, ShieldAlert, Sparkles, Layout, Database, Workflow } from "lucide-react";

const features = [
  {
    icon: FileCode,
    title: "Python Core Logic",
    description: "Robust and efficient backend engine orchestrating the entire security remediation lifecycle.",
  },
  {
    icon: ShieldAlert,
    title: "Semgrep Security",
    description: "Lightning-fast static analysis to instantly identify vulnerabilities across your repositories.",
  },
  {
    icon: Sparkles,
    title: "Groq Llama 3.3 AI",
    description: "State-of-the-art Llama 3.3 model on Groq providing lightning-fast, context-aware code patches.",
  },
  {
    icon: Layout,
    title: "Next.js & Tailwind",
    description: "Lightning fast, beautiful and responsive frontend experience for seamless operations.",
  },
  {
    icon: Database,
    title: "Supabase",
    description: "Real-time, scalable PostgreSQL database managing user and vulnerability metadata.",
  },
  {
    icon: Workflow,
    title: "n8n Automation",
    description: "Advanced workflow automation to integrate with CI/CD and your existing developer tooling.",
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powered by a Modern Tech Stack</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Vajra leverages the most powerful tools in the modern ecosystem to deliver unprecedented security automation and intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl hover:bg-slate-900/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
