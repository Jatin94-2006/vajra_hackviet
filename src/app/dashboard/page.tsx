"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ShieldAlert, Cpu, Check, FileCode, Zap, Download, Home, Trash2, XOctagon, FileText } from "lucide-react";
import Link from "next/link";

type Vulnerability = {
  id: string;
  file: string;
  line: number;
  severity: string;
  confidence: string;
  issue_text: string;
  code: string;
};

export default function Dashboard() {
  const [userPlan, setUserPlan] = useState<'Free' | 'Premium'>('Free');
  const [credits, setCredits] = useState(50);
  
  const [repoUrl, setRepoUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [scanSessionId, setScanSessionId] = useState<string | null>(null);
  const [scanTime, setScanTime] = useState<string>("0.0");
  
  const [isFixing, setIsFixing] = useState(false);
  const [fixesMade, setFixesMade] = useState<Record<string, { code: string, exp: string }>>({});
  const [isAuth, setIsAuth] = useState(false);
  
  // Stop Signal
  const stopRequested = useRef(false);
  const [isAborted, setIsAborted] = useState(false);

  // Persistence Logic
  useEffect(() => {
    const activeUser = localStorage.getItem("vajra_logged_in");
    if (activeUser === "true") {
      setIsAuth(true);
    }
    
    const savedCredits = localStorage.getItem("vajra_credits");
    const savedPlan = localStorage.getItem("vajra_plan");
    
    if (savedCredits) setCredits(parseInt(savedCredits));
    if (savedPlan) setUserPlan(savedPlan as 'Free' | 'Premium');
  }, []);

  useEffect(() => {
    localStorage.setItem("vajra_credits", credits.toString());
    localStorage.setItem("vajra_plan", userPlan);
  }, [credits, userPlan]);

  const handleUpgrade = () => {
    setUserPlan('Premium');
    setCredits(200);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    // Credit Logic
    const scanCost = userPlan === 'Premium' ? 3 : 5;
    if (credits < scanCost) {
      alert("Not enough credits to scan! Please upgrade or wait for weekly reset.");
      return;
    }
    setCredits(prev => prev - scanCost);
    
    setIsScanning(true);
    setScanComplete(false);
    setVulnerabilities([]);
    setSelectedVuln(null);
    setScanSessionId(null);
    setFixesMade({});
    setScanTime("0.0");
    setDetectedLang(null);
    setIsAborted(false);
    stopRequested.current = false;
    const startTimer = Date.now();
    
    // Fake language detection animation
    setTimeout(() => setDetectedLang("Scanning Architecture..."), 500);
    setTimeout(() => {
       const langs = ["JavaScript", "Python", "TypeScript", "NodeJS", "Ruby", "Golang"];
       setDetectedLang(langs[Math.floor(Math.random() * langs.length)] + " Stack Detected");
    }, 2000);

    try {
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl })
      });
      
      const data = await response.json();
      if(data.status === "success") {
        setVulnerabilities(data.results);
        setScanSessionId(data.session_id);
        
        // Log to Analytics 
        const newScanEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          detected: data.results.length,
          fixed: 0,
          repo: repoUrl
        };
        const currentHistory = JSON.parse(localStorage.getItem("vajra_analytics") || "[]");
        localStorage.setItem("vajra_analytics", JSON.stringify([...currentHistory, newScanEntry]));

        // Auto-fix logic
        if (autoFix && data.results.length > 0) {
           alert(`Auto-Fix active! Sequentially resolving ${data.results.length} issues...`);
           for (let i = 0; i < data.results.length; i++) {
               // Exit check
               if (stopRequested.current) {
                 setIsAborted(true);
                 break;
               }

               const target = data.results[i];
               setSelectedVuln(target);
               await executeFix(target, data.session_id);
               
               // Exit check between fixes
               if (stopRequested.current) {
                 setIsAborted(true);
                 break;
               }

               await new Promise(resolve => setTimeout(resolve, 5000));
           }
        }
      } else {
        alert("Scan failed: " + data.detail);
      }
      setScanTime(((Date.now() - startTimer) / 1000).toFixed(1));
    } catch (error) {
      alert("Error connecting to backend");
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const executeFix = async (vuln: Vulnerability, sessionId: string) => {
    if (credits < 2) {
      alert("Not enough credits for AI Fix.");
      return;
    }
    setCredits(prev => prev - 2);
    
    setIsFixing(true);
    try {
      const response = await fetch("http://localhost:8000/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          file_path: vuln.file,
          issue_text: vuln.issue_text,
          code_context: vuln.code,
          line_number: vuln.line
        })
      });
      
      const data = await response.json();
      if(data.status === "success") {
        setFixesMade(prev => ({
          ...prev, 
          [vuln.id]: { code: data.fixed_code, exp: data.explanation || "Issue resolved securely." }
        }));

        const currentHistory = JSON.parse(localStorage.getItem("vajra_analytics") || "[]");
        if (currentHistory.length > 0) {
          currentHistory[currentHistory.length - 1].fixed += 1;
          localStorage.setItem("vajra_analytics", JSON.stringify(currentHistory));
        }
      } else {
        alert("Fix failed: " + data.detail);
      }
    } catch(error) {
      alert("Error connecting to backend for fix");
    } finally {
      setIsFixing(false);
    }
  }

  const handleFixClick = async () => {
    if (!selectedVuln || !scanSessionId) return;
    await executeFix(selectedVuln, scanSessionId);
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 w-full mx-auto flex flex-col gap-6 pb-12">
      {/* Top Credit Bar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-700 py-3 px-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="font-bold text-white flex items-center gap-2">
            <Zap className={`w-5 h-5 ${userPlan === 'Premium' ? 'text-primary' : 'text-yellow-400'}`} />
            {credits} Credits Available
          </div>
          <div className="text-sm text-slate-400 border-l border-slate-700 pl-4">
            Reset: 7 Days | {userPlan === 'Premium' ? '3 cr/scan' : '5 cr/scan'}
          </div>
        </div>
        {userPlan === 'Free' && (
          <button onClick={handleUpgrade} className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-1.5 rounded-full hover:brightness-110">
            Upgrade to Premium (+200)
          </button>
        )}
      </div>

      {/* Header */}
      <div className="glass p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-primary/50 transition-all group" title="Back to Home">
            <Home className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Cpu className="w-8 h-8 text-primary" />
              Vajra Context Sandbox
            </h1>
            <p className="text-slate-400 mt-2">Connect any public GitHub, GitLab, or Bitbucket repository.</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <Link href="/dashboard/analytics" className="px-6 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Intelligence Insights
          </Link>
          <form onSubmit={handleScan} className="w-full md:w-auto flex flex-col gap-3">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Enter URL or org/repo (e.g. appsecco/dvna)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 md:w-80 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-primary text-white"
                required
                disabled={isScanning}
              />
              <button 
                type="submit" 
                disabled={isScanning}
                className="px-6 py-3 bg-primary text-slate-950 font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isScanning ? (
                   <span className="animate-pulse">Scanning...</span>
                ) : (
                   <>Scan <Play className="w-4 h-4" /></>
                )}
              </button>
              
              {isScanning && (
                <button 
                  type="button" 
                  onClick={() => { stopRequested.current = true; }}
                  className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/40 transition-all flex items-center gap-2"
                  title="Terminate Process"
                >
                  <XOctagon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-tighter">Kill</span>
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer w-fit">
              <input type="checkbox" checked={autoFix} onChange={e => setAutoFix(e.target.checked)} className="rounded border-slate-700 text-primary focus:ring-primary bg-slate-900" />
              Enable Auto-Remediate
            </label>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[700px] h-[calc(100vh-280px)]">
        {/* Left Sidebar: Vulnerabilities list */}
        <div className="glass rounded-2xl p-6 flex flex-col overflow-hidden h-full lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Intelligence Report
            </h2>
            {scanComplete && (
               <div className="flex gap-2">
                 <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded border border-slate-700">
                   ⏱️ {scanTime}s
                 </span>
                 <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/30">
                   🛡️ {vulnerabilities.length} Found
                 </span>
                 <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/30">
                   ✅ {Object.keys(fixesMade).length} Solved
                 </span>
                 
                 {/* Audit Certificate Link */}
                 <Link 
                   href={`/dashboard/report/${JSON.parse(localStorage.getItem("vajra_analytics") || "[]").slice(-1)[0]?.id}`}
                   className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] uppercase font-black px-2.5 py-1 rounded shadow-lg shadow-indigo-600/20 transition-all ml-1.5"
                 >
                   <FileText className="w-3 h-3" />
                   Security Report
                 </Link>
               </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {isScanning && (
               <div className="text-center text-slate-400 py-10 animate-pulse flex flex-col items-center gap-3">
                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <div className="flex flex-col gap-1">
                   <span>Advanced Semgrep Scan Initialized</span>
                   {detectedLang && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold">{detectedLang}</span>}
                 </div>
               </div>
             )}

             {isAborted && (
               <div className="text-center text-red-400 py-10 flex flex-col items-center gap-2 bg-red-500/5 rounded-xl border border-red-500/20">
                 <XOctagon className="w-8 h-8" />
                 <p className="font-bold">Process Terminated</p>
                 <p className="text-xs text-red-500/70">Autonomous remediation was manually stopped.</p>
               </div>
             )}
             
             {scanComplete && vulnerabilities.length === 0 && !isScanning && !isAborted && (
               <div className="text-center text-green-400 py-10 flex flex-col items-center gap-2">
                 <Check className="w-8 h-8" />
                 No vulnerabilities found!
               </div>
             )}

             {vulnerabilities.map((vuln) => {
                const isFixed = fixesMade[vuln.id];
                return (
                  <div 
                    key={vuln.id}
                    onClick={() => setSelectedVuln(vuln)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedVuln?.id === vuln.id ? 'bg-primary/20 border-primary' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isFixed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isFixed ? 'PATCHED' : vuln.severity}
                      </span>
                      <span className="text-xs text-slate-500">{vuln.file}:{vuln.line}</span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${isFixed ? 'text-green-200 line-through opacity-70' : 'text-slate-200'}`}>{vuln.issue_text}</p>
                  </div>
                );
             })}
          </div>
        </div>

        {/* Right Area: Code Diff Viewer and AI Action */}
        <div className="lg:col-span-3 glass rounded-2xl flex flex-col overflow-hidden h-full">
          {!selectedVuln ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <FileCode className="w-16 h-16 mb-4 opacity-50" />
               <p>Select a vulnerability to view context & AI Explanations</p>
             </div>
          ) : (
             <div className="flex flex-col h-full overflow-hidden">
               <div className="p-6 border-b border-card-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 flex-shrink-0">
                 <div className="flex-1 min-w-0">
                   <h2 className="text-lg font-bold truncate max-w-sm" title={selectedVuln.file}>{selectedVuln.file}</h2>
                   <p className="text-sm text-slate-400 mt-1 truncate max-w-md" title={selectedVuln.issue_text}>Issue: {selectedVuln.issue_text}</p>
                 </div>
                 
                 <div className="flex gap-2">
                   <button 
                    onClick={handleFixClick}
                    disabled={isFixing || !!fixesMade[selectedVuln.id]}
                    className="px-5 py-2 bg-gradient-to-r from-primary to-primary-dark text-slate-950 font-bold rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:brightness-110 transition-all disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
                   >
                     {isFixing ? 'Generating...' : fixesMade[selectedVuln.id] ? 'Applied' : 'Fix Code (2 Cr)'}
                   </button>
                   
                   {Object.keys(fixesMade).length > 0 && scanSessionId && (
                     <a 
                       href={`http://localhost:8000/api/download/${scanSessionId}`}
                       target="_blank"
                       className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                     >
                       <Download className="w-4 h-4" /> Download Repaired ZIP
                     </a>
                   )}
                 </div>
               </div>
               
               {fixesMade[selectedVuln.id] && (
                 <div className="p-4 bg-primary/10 border-b border-primary/20 text-sm text-primary flex-shrink-0">
                   <strong>AI Explanation:</strong> {fixesMade[selectedVuln.id].exp}
                 </div>
               )}
               
               <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0d1117] min-h-0">
                 {/* Original Vulnerable Code */}
                 <div className={`flex-1 overflow-auto border-slate-800 p-4 transition-all w-full ${fixesMade[selectedVuln.id] ? 'md:w-1/2 border-r' : 'md:w-full'}`}>
                   <div className="flex justify-between items-center mb-2">
                     <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Original Code</div>
                     <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-mono">- DELETING ORIGINAL</span>
                   </div>
                   <pre className="text-sm font-mono text-red-400 bg-red-950/20 w-fit min-w-full p-4 rounded-lg border border-red-500/10">
                     <code>{selectedVuln.code}</code>
                   </pre>
                 </div>
                 
                 {/* Fixed Code via Gemini */}
                 <AnimatePresence>
                   {(isFixing || fixesMade[selectedVuln.id]) && (
                     <motion.div 
                       initial={{ opacity: 0, width: 0 }}
                       animate={{ opacity: 1, width: '100%' }}
                       className="flex-1 overflow-auto p-4 relative bg-green-950/10 md:w-1/2"
                     >
                       <div className="flex justify-between items-center mb-2">
                         <div className="text-xs text-green-500 uppercase font-bold tracking-wider">AI Secured Code</div>
                         {!isFixing && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-mono">+ APPENDING FIX</span>}
                       </div>
                       {isFixing ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 pt-10">
                           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                           <p className="text-sm animate-pulse">Running autonomous remediation...</p>
                         </div>
                       ) : (
                         <pre className="text-sm font-mono text-green-400 bg-green-950/20 w-fit min-w-full p-4 rounded-lg border border-green-500/10">
                           <code>{fixesMade[selectedVuln.id].code}</code>
                         </pre>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
