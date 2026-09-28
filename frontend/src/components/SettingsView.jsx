import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Key,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Server,
  Zap,
  Loader2
} from 'lucide-react';
import { seedHindsightBank, fetchHealth } from '../api';

export default function SettingsView({ healthInfo, onRefreshHealth }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const isConnected = healthInfo?.hindsight?.configured;
  const bankId = healthInfo?.hindsight?.bank_id || 'proposal-iq-demo';
  const baseUrl = healthInfo?.hindsight?.base_url || 'https://api.hindsight.vectorize.io';

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetchHealth();
      setTestResult({
        success: true,
        message: `Connection Verified: Status is ${res.status.toUpperCase()}. Hindsight Bank '${res.hindsight.bank_id}' is active.`,
      });
      if (onRefreshHealth) onRefreshHealth();
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection Error: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSeedBank = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedHindsightBank();
      setSeedResult({
        success: res.success,
        message: res.message,
      });
    } catch (err) {
      setSeedResult({
        success: false,
        message: `Seeding Error: ${err.message}`,
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
          Configuration & Environment
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          System Settings & Hindsight Integration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review Hindsight Cloud bank status, server security parameters, and institutional memory synchronization.
        </p>
      </div>

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white text-sm">Enterprise Security Guarantee</h4>
          <p className="text-slate-300 leading-relaxed">
            API keys (<code className="font-mono text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">HINDSIGHT_API_KEY</code>, <code className="font-mono text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">OPENAI_API_KEY</code>) are strictly resolved on the server-side via backend environment variables. No credentials or secrets are ever bundled, transmitted, or accessible to the browser frontend.
          </p>
        </div>
      </div>

      {/* Hindsight Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Hindsight Cloud Memory Bank</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{baseUrl}</p>
            </div>
          </div>

          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span>{isConnected ? 'Connected & Ready' : 'Local Fallback Active'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-1">Target Memory Bank ID</span>
            <span className="text-slate-200 font-mono font-bold text-sm">{bankId}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-1">API Key Resolution</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {isConnected ? '✓ Configured (.env server-side)' : 'Missing from environment'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-1">Client SDK Version</span>
            <span className="text-slate-200 font-mono text-sm">hindsight-client v0.10.1</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-1">Memory Persistence Mode</span>
            <span className="text-slate-200 font-mono text-sm">
              {isConnected ? 'Hybrid (Hindsight Cloud + Local Mirror)' : 'Local File Persistence'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Pinging Server...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Test API Connectivity</span>
              </>
            )}
          </button>

          <button
            onClick={handleSeedBank}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            {seeding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Memories...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Seed / Re-sync Hindsight Bank</span>
              </>
            )}
          </button>
        </div>

        {/* Test / Seed Results */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testResult.message}</span>
          </div>
        )}

        {seedResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              seedResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{seedResult.message}</span>
          </div>
        )}
      </div>

      {/* Backend Environment Setup Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Environment Configuration Reference</h3>
        <p className="text-xs text-slate-400">
          The backend reads environment variables from <code className="text-indigo-300 font-mono">.env</code>:
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`# Hindsight Cloud Credentials
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=proposal-iq-demo

# Optional LLM Enhancement
OPENAI_API_KEY=your_openai_api_key`}
        </pre>
      </div>
    </div>
  );
}
