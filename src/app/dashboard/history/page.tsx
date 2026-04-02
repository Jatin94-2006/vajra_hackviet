"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  History, Clock, Shield, Search, ArrowRight, 
  Trash2, ExternalLink, Zap, CheckCircle, 
  AlertTriangle, Filter, LayoutDashboard
} from "lucide-react";
import Link from "next/link";

type HistoryItem = {
  id: string;
  timestamp: string;
  detected: number;
  fixed: number;
  repo: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const rawHistory = localStorage.getItem("vajra_analytics");
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory);
      // Sort by newest first
      setHistory(parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
    setIsLoaded(true);
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your entire scan history?")) {
      localStorage.removeItem("vajra_analytics");
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => 
    item.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 w-full mx-auto max-w-7xl flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <History className="w-10 h-10 text-primary" />
            Scan <span className="text-primary/70">Registry</span>
          </h1>
          <p className="text-slate-400 mt-2">Comprehensive audit log of all autonomous security sessions.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Back to Sandbox
          </Link>
          <button 
            onClick={clearHistory}
            className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Registry
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by repository name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-white"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
          <Filter className="w-4 h-4" />
          Sorted by Newest
        </div>
      </div>

      {/* History List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHistory.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
            <History className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">No scan sessions recorded yet.</p>
            <Link href="/dashboard" className="mt-4 text-primary hover:underline">Start your first scan</Link>
          </div>
        ) : (
          filteredHistory.map((item, idx) => {
            const date = new Date(item.timestamp);
            const efficiency = item.detected > 0 ? Math.round((item.fixed / item.detected) * 100) : 100;
            
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                    <Shield className={`w-7 h-7 ${efficiency > 70 ? 'text-primary' : 'text-amber-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                       {item.repo}
                       <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                      <span className="text-slate-400">Session: {item.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Detected</span>
                    <span className="text-xl font-bold flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="w-4 h-4" />
                      {item.detected}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Remediated</span>
                    <span className="text-xl font-bold flex items-center gap-2 text-emerald-500">
                      <CheckCircle className="w-4 h-4" />
                      {item.fixed}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-6 border-l border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Efficiency</span>
                    <div className="flex items-center gap-3">
                       <span className={`text-xl font-black ${efficiency > 80 ? 'text-primary' : 'text-amber-400'}`}>
                         {efficiency}%
                       </span>
                       <div className="hidden lg:block w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${efficiency}%` }}></div>
                       </div>
                    </div>
                  </div>

                  <Link 
                    href="/dashboard"
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-primary hover:text-slate-950 transition-all group/btn ml-auto md:ml-0"
                    title="Open in Sandbox"
                  >
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
