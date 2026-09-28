import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Brain,
  Copy,
  Download,
  Check,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  generateGenericProposal,
  generateHindsightProposal,
  recordOutcome
} from '../api';

export default function ProposalView({
  profile,
  setActiveTab,
  onOutcomeRecorded
}) {
  const [genericProposal, setGenericProposal] = useState(null);
  const [hindsightProposal, setHindsightProposal] = useState(null);
  const [memoriesUsed, setMemoriesUsed] = useState([]);
  const [loadingMode, setLoadingMode] = useState(null); // 'generic' | 'hindsight' | null
  const [loadingStep, setLoadingStep] = useState(0); // 0, 1, 2 for multi-step loading
  const [activeViewTab, setActiveViewTab] = useState('hindsight'); // 'hindsight' | 'generic' | 'compare'
  const [copied, setCopied] = useState(false);

  // Outcome modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeType, setOutcomeType] = useState('won'); // 'won' | 'lost'
  const [outcomeLesson, setOutcomeLesson] = useState('');
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeSuccessMessage, setOutcomeSuccessMessage] = useState(null);

  // Multi-step loading runner for Hindsight
  const handleGenerateHindsight = async () => {
    if (!profile) return;
    setLoadingMode('hindsight');
    setLoadingStep(0); // "Searching organizational memory..."

    const step1Timer = setTimeout(() => {
      setLoadingStep(1); // "Learning from previous proposals..."
    }, 600);

    const step2Timer = setTimeout(() => {
      setLoadingStep(2); // "Generating personalized proposal..."
    }, 1400);

    try {
      const res = await generateHindsightProposal(profile);
      setHindsightProposal(res.proposal);
      setMemoriesUsed(res.memories || []);
      setActiveViewTab('hindsight');
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setLoadingMode(null);
    }
  };

  const handleGenerateGeneric = async () => {
    if (!profile) return;
    setLoadingMode('generic');
    try {
      const res = await generateGenericProposal(profile);
      setGenericProposal(res.proposal);
      setActiveViewTab('generic');
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (text, filename) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeLesson.trim()) {
      alert('Please enter a short lesson learned from this bid.');
      return;
    }
    setSubmittingOutcome(true);
    try {
      const res = await recordOutcome({
        client: profile.client_name,
        project: profile.project_name,
        industry: 'Enterprise Technology',
        outcome: outcomeType,
        lessons: outcomeLesson.trim(),
        approach: 'Tailored proposal generated with ProposalIQ Hindsight memory',
        requirements: profile.requirements || [],
      });

      setOutcomeSuccessMessage(res.message);
      setShowOutcomeModal(false);
      setOutcomeLesson('');
      if (onOutcomeRecorded) onOutcomeRecorded(res.record);
    } catch (err) {
      alert(`Failed to save outcome: ${err.message}`);
    } finally {
      setSubmittingOutcome(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">No RFP Document Loaded</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload or paste an RFP document first to extract requirements and generate an intelligent proposal.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
        >
          Go to Analyze RFP
        </button>
      </div>
    );
  }

  const currentDisplayProposal =
    activeViewTab === 'hindsight' ? hindsightProposal : genericProposal;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
          Stage 03 — Generation & Memory Application
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Proposal Generation Workspace
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Target Client: <strong className="text-slate-200">{profile.client_name}</strong> • Project: <strong className="text-slate-200">{profile.project_name}</strong>
        </p>
      </div>

      {/* Outcome Success Notification */}
      {outcomeSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{outcomeSuccessMessage}</span>
          </div>
          <button
            onClick={() => setOutcomeSuccessMessage(null)}
            className="text-emerald-400/80 hover:text-emerald-300 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2 Choice Cards: Without Memory vs With Hindsight Memory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Choice 1: Without Memory */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Baseline (Prompt Only)
              </span>
              <FileText className="w-5 h-5 text-slate-500" />
            </div>

            <h3 className="text-lg font-bold text-white">WITHOUT MEMORY</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a proposal using only the current RFP. Standard boilerplate model response without historical institutional context or risk mitigation.
            </p>

            <ul className="text-xs text-slate-500 space-y-1 pt-1">
              <li>• Simple text extraction regurgitation</li>
              <li>• Generic compliance statements</li>
              <li>• No risk lessons or pilot phase</li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={handleGenerateGeneric}
              disabled={loadingMode !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              {loadingMode === 'generic' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Baseline...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Without Memory</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Choice 2: With Hindsight Memory (Hero Card) */}
        <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500/50 p-6 flex flex-col justify-between shadow-lg shadow-indigo-950/40">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-bold text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>RECOMMENDED</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Hindsight Memory Powered
              </span>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>WITH HINDSIGHT MEMORY</span>
              <Brain className="w-5 h-5 text-indigo-400" />
            </h3>

            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Generate a proposal informed by relevant organizational experience. Injects verified winning proof points and actively avoids past loss traps.
            </p>

            <ul className="text-xs text-indigo-300/80 space-y-1 pt-1">
              <li>✓ Named security governance model (NorthStar/FinCore wins)</li>
              <li>✓ 6-week controlled pilot framework</li>
              <li>✓ Purges generic compliance language that caused past losses</li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={handleGenerateHindsight}
              disabled={loadingMode !== null}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/40"
            >
              {loadingMode === 'hindsight' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>
                    {loadingStep === 0 && 'Searching organizational memory...'}
                    {loadingStep === 1 && 'Learning from previous proposals...'}
                    {loadingStep === 2 && 'Generating personalized proposal...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate With Hindsight Memory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Proposal Viewer & Comparison */}
      {(hindsightProposal || genericProposal) && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-300">
          {/* Viewer Toolbar */}
          <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              {hindsightProposal && (
                <button
                  onClick={() => setActiveViewTab('hindsight')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeViewTab === 'hindsight'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-indigo-300" />
                  <span>With Hindsight Memory</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
                </button>
              )}

              {genericProposal && (
                <button
                  onClick={() => setActiveViewTab('generic')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeViewTab === 'generic'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Without Memory (Baseline)</span>
                </button>
              )}

              {hindsightProposal && genericProposal && (
                <button
                  onClick={() => setActiveViewTab('compare')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeViewTab === 'compare'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Side-by-Side Comparison</span>
                </button>
              )}
            </div>

            {/* Actions: Copy, Download, Record Outcome */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopy(
                    activeViewTab === 'hindsight'
                      ? hindsightProposal
                      : genericProposal
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() =>
                  handleDownload(
                    activeViewTab === 'hindsight'
                      ? hindsightProposal
                      : genericProposal,
                    activeViewTab === 'hindsight'
                      ? `proposal_${profile.client_name.replace(/\s+/g, '_')}_hindsight.md`
                      : `proposal_${profile.client_name.replace(/\s+/g, '_')}_generic.md`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1"></div>

              {/* Record Outcome Button */}
              <button
                onClick={() => setShowOutcomeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Record Proposal Outcome</span>
              </button>
            </div>
          </div>

          {/* Active Memories Pill Bar (when viewing Hindsight) */}
          {activeViewTab === 'hindsight' && memoriesUsed.length > 0 && (
            <div className="p-3 px-6 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-300">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  <strong>Hindsight Injected:</strong> {memoriesUsed.length} memories applied
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">
                  {memoriesUsed.filter(m => String(m.outcome).toLowerCase() === 'won').length} Wins
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 font-semibold">
                  {memoriesUsed.filter(m => String(m.outcome).toLowerCase() === 'lost').length} Losses
                </span>
              </div>

              <button
                onClick={() => setActiveTab('memory')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Inspect memory bank</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Content Document Display */}
          <div className="p-6 lg:p-10">
            {activeViewTab === 'compare' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                {/* Generic column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    <h4 className="font-bold text-sm text-slate-300">Without Memory (Baseline)</h4>
                  </div>
                  <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed max-h-[700px] overflow-y-auto p-4 bg-slate-950 rounded-xl">
                    {genericProposal}
                  </pre>
                </div>

                {/* Hindsight column */}
                <div className="space-y-4 lg:pl-8 pt-6 lg:pt-0">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h4 className="font-bold text-sm text-indigo-300">With Hindsight Memory (Tailored)</h4>
                  </div>
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[700px] overflow-y-auto p-4 bg-slate-950 border border-indigo-500/20 rounded-xl">
                    {hindsightProposal}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800/80 rounded-2xl p-6 lg:p-10 shadow-2xl">
                <article className="prose prose-invert prose-slate max-w-none text-xs lg:text-sm font-sans leading-relaxed">
                  <pre className="font-sans whitespace-pre-wrap text-slate-200 leading-relaxed bg-transparent p-0 border-0">
                    {currentDisplayProposal}
                  </pre>
                </article>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outcome Recording Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Record Proposal Outcome</h3>
              </div>
              <button
                onClick={() => setShowOutcomeModal(false)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Did <strong>{profile.client_name}</strong> accept this bid? Persisting this outcome into Hindsight Cloud ensures future proposals automatically adopt what succeeded or avoid what failed.
            </p>

            <form onSubmit={handleSubmitOutcome} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Proposal Result
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOutcomeType('won')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      outcomeType === 'won'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>WON DEAL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutcomeType('lost')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      outcomeType === 'lost'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>LOST DEAL</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  What should ProposalIQ remember from this proposal?
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Be specific: key objections, winning compliance terms, or delivery models that swayed the buyer.
                </p>
                <textarea
                  rows={4}
                  required
                  value={outcomeLesson}
                  onChange={(e) => setOutcomeLesson(e.target.value)}
                  placeholder={
                    outcomeType === 'won'
                      ? 'e.g. Dedicated security owner and 6-week pilot structure gave the procurement board complete confidence.'
                      : 'e.g. Missing concrete accessibility evidence and generic SLA clauses led evaluator to downgrade scoring.'
                  }
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingOutcome}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  {submittingOutcome ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Retaining in Hindsight...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-3.5 h-3.5" />
                      <span>Store Lesson in Hindsight Bank</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
