"use client";

import { motion } from "framer-motion";
import { Search, PenTool, CheckCircle } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      icon: Search,
      title: "Scan",
      description: "Continuous monitoring of your repositories instantly identifying vulnerabilities using advanced pattern matching."
    },
    {
      icon: PenTool,
      title: "Fix",
      description: "Intelligent AI engine analyzes context and generates secure, production-ready code patches autonomously."
    },
    {
      icon: CheckCircle,
      title: "Verify",
      description: "Automated test generation and execution to mathematically ensure the vulnerability is patched without regressions."
    }
  ];

  return (
    <section id="workflow" className="py-24 relative overflow-hidden">
      <div className="ambient-light bg-primary-dark/10 w-[800px] h-[800px] top-[0%] left-[-20%]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Autonomous Workflow</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From detection to resolution, Vajra handles everything seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-8 relative z-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
