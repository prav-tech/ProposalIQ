import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCheck,
  Sparkles,
  Building,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Code,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { analyzeRfpFile, analyzeRfpText, analyzeSampleRfp } from '../api';

export default function AnalyzeView({
  profile,
  setProfile,
  setActiveTab,
  onProposalReady
}) {
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      let res;
      if (inputMode === 'upload') {
        if (!file) throw new Error('Please select or drop a PDF file first.');
        res = await analyzeRfpFile(file);
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 30) {
          throw new Error('Please enter at least 30 characters of RFP text.');
        }
        res = await analyzeRfpText(pastedText);
      }

      setProfile(res.profile);
      setSourceInfo({
        filename: res.filename,
        size: res.filesize,
        length: res.text_length,
      });
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeSampleRfp();
      setProfile(res.profile);
      setSourceInfo({
        filename: res.filename,
        size: res.filesize,
        length: res.text_length,
        isSample: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to load sample RFP');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
            Stage 01 — Document Ingestion
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Analyze a new RFP
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload a text-based RFP PDF or paste specifications to extract client requirements, technical needs, and criteria.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-semibold transition-all shrink-0 self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Load Sample RFP (FinCore Bank)</span>
        </button>
      </div>

      {/* Input Mode Tabs & Dropzone */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                inputMode === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                inputMode === 'paste'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste RFP Text
            </button>
          </div>

          {sourceInfo && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Loaded: {sourceInfo.filename}</span>
            </div>
          )}
        </div>

        {inputMode === 'upload' ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 lg:p-12 text-center cursor-pointer transition-all ${
              file
                ? 'border-indigo-500/60 bg-indigo-500/5'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            
            <h3 className="text-base font-semibold text-white">
              {file ? file.name : 'Drop your RFP here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {file
                ? `Size: ${(file.size / 1024).toFixed(1)} KB — Ready to analyze`
                : 'PDF files up to 25MB supported (text-readable PDFs)'}
            </p>

            <div className="mt-5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
                <FileText className="w-3.5 h-3.5" />
                <span>{file ? 'Change PDF' : 'Choose PDF'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Paste Complete RFP Content
            </label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste RFP scope, objectives, requirements, timeline, budget, and evaluation criteria here..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analyze Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Uses deterministic section extraction + requirement parsing.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || (inputMode === 'upload' && !file && !sourceInfo)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Requirements...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Analyze RFP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted RFP Brief */}
      {profile && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-0.5">
                Stage 02 — Structured Brief
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Extracted RFP Brief</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showJson ? 'Hide JSON' : 'Raw JSON'}</span>
              </button>

              <button
                onClick={() => {
                  if (onProposalReady) onProposalReady();
                  setActiveTab('proposals');
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/30"
              >
                <span>Proceed to Proposal Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Cards: Client, Project, Budget, Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Client</span>
              </div>
              <div className="text-base font-bold text-white truncate" title={profile.client_name}>
                {profile.client_name || 'Not detected'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Project</span>
              </div>
              <div className="text-base font-bold text-white truncate" title={profile.project_name}>
                {profile.project_name || 'Not detected'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget</span>
              </div>
              <div className="text-base font-bold text-white truncate" title={profile.budget}>
                {profile.budget || 'Not specified'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Timeline</span>
              </div>
              <div className="text-base font-bold text-white truncate" title={profile.timeline}>
                {profile.timeline || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Detailed Requirements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Functional Requirements */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Business Requirements</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">
                    {profile.requirements?.length || 0}
                  </span>
                </h3>
              </div>
              <ul className="space-y-2.5">
                {(profile.requirements || []).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 font-mono flex items-center justify-center shrink-0 text-[10px] mt-0.5 font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
                {(!profile.requirements || profile.requirements.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No explicit bulleted requirements found.</p>
                )}
              </ul>
            </div>

            {/* Technical Requirements */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Technical & Security Requirements</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                    {profile.technical_requirements?.length || 0}
                  </span>
                </h3>
              </div>
              <ul className="space-y-2.5">
                {(profile.technical_requirements || []).map((tech, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded bg-slate-800 text-purple-400 font-mono flex items-center justify-center shrink-0 text-[10px] mt-0.5 font-bold">
                      T{idx + 1}
                    </span>
                    <span className="leading-relaxed">{tech}</span>
                  </li>
                ))}
                {(!profile.technical_requirements || profile.technical_requirements.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No specific technical specifications detected.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Evaluation Criteria */}
          {profile.evaluation_criteria && profile.evaluation_criteria.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Evaluation & Selection Criteria</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                    {profile.evaluation_criteria.length}
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {profile.evaluation_criteria.map((crit, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <span className="font-semibold text-indigo-400 text-[11px] block mb-1">
                      Criterion {idx + 1}
                    </span>
                    <p className="text-slate-300 leading-snug">{crit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Expander */}
          {showJson && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-semibold text-slate-400">Structured Profile JSON</span>
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-3 bg-slate-900 rounded-lg">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
