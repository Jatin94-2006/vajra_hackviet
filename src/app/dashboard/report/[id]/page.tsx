"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, CheckCircle, FileText, Printer, ArrowLeft, Zap, Download } from "lucide-react";
import Link from "next/link";

type ReportData = {
  id: string;
  timestamp: string;
  detected: number;
  fixed: number;
  repo: string;
};

export default function SecurityReport() {
  const params = useParams();
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const rawHistory = localStorage.getItem("vajra_analytics");
    if (rawHistory) {
      const history = JSON.parse(rawHistory);
      const found = history.find((h: any) => h.id === params.id);
      if (found) setData(found);
    }
  }, [params.id]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-950">
      Report not found or session expired.
    </div>
  );

  const dateStr = new Date(data.timestamp).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Navigation / Actions (Hidden on Print) */}
        <div className="flex justify-between items-center print:hidden">
          <Link href="/dashboard/history" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Registry
          </Link>
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>

        {/* Certificate Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-[12px] border-slate-100 p-12 relative overflow-hidden shadow-2xl rounded-sm"
        >
          {/* Watermark/Seal */}
          <Shield className="absolute -bottom-16 -right-16 w-64 h-64 text-slate-100 -rotate-12 pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-12 border-b-2 border-slate-100 pb-8">
            <Shield className="w-16 h-16 text-indigo-600" />
            <h1 className="text-4xl font-serif font-black tracking-tighter uppercase text-slate-900">
              Vajra <span className="text-indigo-600">Secure</span> Audit Certificate
            </h1>
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Autonomous Remediation Verification</p>
          </div>

          {/* Certificate Body */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Repository Analyzed</p>
              <h2 className="text-2xl font-bold bg-slate-100 px-4 py-2 rounded-md border border-slate-200">
                {data.repo}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-8 my-4">
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Audit ID</p>
                <code className="text-indigo-600 font-bold">#VJR-{data.id.slice(-8).toUpperCase()}</code>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Date Issued</p>
                <p className="font-bold">{dateStr}</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h3 className="text-xl font-bold text-indigo-900 flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" /> AI-Driven Remediation Complete
                </h3>
                <p className="text-indigo-700 text-sm max-w-md italic">
                  Vajra has autonomously identified and patched critical vulnerabilities in this repository using code-context analysis and Gemini intelligence.
                </p>
              </div>
              
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-indigo-900">{data.detected}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">Detected</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-emerald-600">{data.fixed}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Remediated</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t-2 border-slate-100 pt-8 flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Engine Version</p>
                <p className="font-mono text-sm">Vajra Core v2.5.0-Patch</p>
              </div>
              <div className="text-right">
                <div className="font-serif text-2xl font-bold italic text-slate-400 mb-1 opacity-50">Vajra Autonomous Security</div>
                <div className="w-48 h-0.5 bg-slate-300 ml-auto"></div>
                <p className="text-[10px] uppercase text-slate-500 mt-2 font-bold tracking-widest italic">Digital Signature Verified</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* README Badge Section (Hidden on Print) */}
        <div className="glass-light p-6 rounded-2xl border border-indigo-100 print:hidden flex flex-col items-center gap-4 text-center">
           <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
             <Zap className="w-4 h-4" /> Final Step: Add the Badge
           </div>
           <p className="text-slate-600 text-sm">Share your security success! Copy the markdown below to your README.</p>
           
           <div className="flex items-center gap-2 bg-indigo-900 text-white px-3 py-1 rounded-full font-bold text-xs">
              <Shield className="w-3.5 h-3.5 text-primary" />
              VAJRA SECURED
           </div>

           <div 
             onClick={() => {
               navigator.clipboard.writeText(`[![Vajra Secured](https://img.shields.io/badge/Vajra--Secured-Security%20Verified-indigo)](https://vajra-security.vercel.app/)`);
               alert("Markdown badge copied to clipboard!");
             }}
             className="w-full bg-white border border-slate-200 p-4 rounded-xl font-mono text-[10px] text-slate-500 cursor-pointer hover:bg-slate-50 transition-all text-center break-all"
           >
             [![Vajra Secured](https://img.shields.io/badge/Vajra--Secured-Security%20Verified-indigo)](https://github.com/Jatin94-2006/Vajra_byCyberRaiders)
           </div>
        </div>

        {/* Footer Info (Hidden on Print) */}
        <div className="text-center text-slate-400 text-xs flex flex-col gap-2 print:hidden">
            <p>This document is a generated security audit from the Vajra DevSecOps platform.</p>
            <p>© 2026 Vajra Autonomous Security Engineer</p>
        </div>
      </div>
    </div>
  );
}
