"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, TrendingUp, CheckCircle, Activity, Layout } from "lucide-react";
import Link from "next/link";

type AnalyticsItem = {
  id: string;
  timestamp: string;
  detected: number;
  fixed: number;
  repo: string;
};

// Colors for the charts
const COLORS = {
  primary: "#22d3ee", // Cyan
  secondary: "#8b5cf6", // Purple
  success: "#10b981", // Emerald
  danger: "#ef4444", // Red
  warning: "#f59e0b", // Amber
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const rawData = localStorage.getItem("vajra_analytics");
    let history: AnalyticsItem[] = [];
    
    if (rawData) {
      history = JSON.parse(rawData);
    }

    // Seed mock data if empty for demo purposes
    if (history.length === 0) {
      const now = new Date();
      history = [
        { id: "1", timestamp: new Date(now.getTime() - 86400000 * 4).toISOString(), detected: 12, fixed: 4, repo: "auth-service" },
        { id: "2", timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), detected: 18, fixed: 12, repo: "data-pipeline" },
        { id: "3", timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), detected: 8, fixed: 8, repo: "web-ui" },
        { id: "4", timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(), detected: 15, fixed: 10, repo: "payment-gateway" },
      ];
      localStorage.setItem("vajra_analytics", JSON.stringify(history));
    }

    setData(history);
    setHasLoaded(true);
  }, []);

  // Format data for Recharts
  const chartData = data.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    detected: item.detected,
    fixed: item.fixed,
    efficiency: Math.round((item.fixed / (item.detected || 1)) * 100),
    repo: item.repo
  }));

  const totalDetected = data.reduce((acc, curr) => acc + curr.detected, 0);
  const totalFixed = data.reduce((acc, curr) => acc + curr.fixed, 0);
  const avgEfficiency = Math.round((totalFixed / (totalDetected || 1)) * 100);

  const securityScore = Math.min(100, Math.max(0, 100 - (totalDetected - totalFixed) * 2));

  if (!hasLoaded) return null;

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 w-full mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Sandbox
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            Threat Intelligence <span className="text-primary/70">Analytics</span>
          </h1>
          <p className="text-slate-400 mt-2">Autonomous remediation performance and vulnerability density trends.</p>
        </div>

        <div className="flex gap-4">
          <div className="glass px-6 py-4 rounded-2xl border border-primary/20 flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Security Score</span>
            <span className="text-3xl font-black text-primary">{securityScore}%</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Scans", value: data.length, icon: Shield, color: COLORS.primary },
          { label: "Issues Detected", value: totalDetected, icon: Zap, color: COLORS.warning },
          { label: "Issues Remediated", value: totalFixed, icon: CheckCircle, color: COLORS.success },
          { label: "Efficiency Rate", value: `${avgEfficiency}%`, icon: TrendingUp, color: COLORS.secondary }
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 border border-white/10">
              <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-sm text-slate-400">{kpi.label}</p>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Vulnerability Density Over Time */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-3xl border border-white/5"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Vulnerability Density Density
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="detected" stroke={COLORS.warning} fillOpacity={1} fill="url(#colorDetected)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Remediation Efficiency Comparison */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-3xl border border-white/5"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Remediation Success Flow
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Legend iconType="circle" />
                <Bar name="Issues Detected" dataKey="detected" fill={COLORS.warning} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Issues Fixed" dataKey="fixed" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Bottom Row - Efficiency Trend */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass p-8 rounded-3xl border border-white/5"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Autonomous Efficiency (%)
          </h2>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="efficiency" 
                stroke={COLORS.primary} 
                strokeWidth={4} 
                dot={{ r: 6, fill: COLORS.primary, strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
