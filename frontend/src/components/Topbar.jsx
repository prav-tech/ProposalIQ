import React from 'react';
import {
  FileText,
  Sparkles,
  User,
  Building2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Topbar({ onSelectSample, healthInfo, setActiveTab }) {
  const isConnected = healthInfo?.hindsight?.configured;

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between z-10 shrink-0">
      {/* Workspace Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Global Enterprise Bid Desk</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-300 font-semibold">Production</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hindsight Bank: <strong className="text-slate-300 font-mono">{healthInfo?.hindsight?.bank_id || 'proposal-iq-demo'}</strong></span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSelectSample}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 hover:text-indigo-200 border border-indigo-700/50 text-xs font-semibold transition-all shadow-sm shadow-indigo-950"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Try Sample RFP (FinCore Bank)</span>
        </button>

        <button
          onClick={() => setActiveTab('analyze')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm shadow-indigo-600/30"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Analyze New RFP</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        {/* User avatar placeholder */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
            JD
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Jordan Doe</p>
            <p className="text-[10px] text-slate-500 leading-tight">Head of Proposals</p>
          </div>
        </div>
      </div>
    </header>
  );
}
