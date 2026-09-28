import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function LearningView({ setActiveTab }) {
  const [activeStep, setActiveStep] = useState(2); // 0: baseline, 1: after win, 2: after loss

  const progressionData = [
    {
      step: '01',
      title: 'First Proposal (No Memory)',
      subtitle: 'Generic RFP-Only AI Response',
      description:
        'Without memory, the model merely paraphrases the uploaded RFP. It uses generic compliance language ("we meet industry standards") and lacks risk ownership.',
      color: 'slate',
      badge: 'Baseline',
      sampleSnippet: `## Security & Compliance\nThe solution will incorporate standard security best practices, including user authentication, data encryption, and access controls as required by industry standards.\n\n## Implementation\nStandard 5-phase delivery without pilot verification or named risk ownership.`,
      injectedLesson: null,
      critique: 'Evaluation Risk: High probability of being disqualified by strict enterprise procurement boards.'
    },
    {
      step: '02',
      title: 'After Retaining a Win (NorthStar Health)',
      subtitle: 'Proven Delivery & Governance Added',
      description:
        'Having retained the successful PROP-001 engagement, ProposalIQ automatically incorporates explicit named security governance and a 6-week controlled pilot.',
      color: 'emerald',
      badge: '+1 Win Retained',
      sampleSnippet: `## Security, Risk & Compliance\n- Named Security Ownership: Explicit Dedicated Security & Compliance Lead assigned directly to project governance, providing signed bi-weekly audit attestations.\n\n## Implementation Plan\n- Phase 2 Pilot Deployment: Structured 6-week Phase 1 Production Pilot with defined success metrics before general rollout (modeled on NorthStar Health win).`,
      injectedLesson: 'NorthStar Health (PROP-001): Healthcare and financial buyers responded strongly to explicit security ownership and a clear pilot phase.',
      critique: 'Buyer Confidence: Up 40%. Evaluators see concrete governance and pilot risk reduction.'
    },
    {
      step: '03',
      title: 'After Retaining a Loss (CivicWorks & ShopSphere)',
      subtitle: 'Noticeably Smarter & Risk-Proofed',
      description:
        'ProposalIQ uses negative signal from lost bids as guardrails. It refuses to reuse vague compliance phrases and proactively demands third-party audit artifacts.',
      color: 'purple',
      badge: '+Loss Lessons Guardrail',
      sampleSnippet: `## Proposal Strategy & Loss-Prevention Guardrails\n- High-Signal Loss Avoidance: Deliberately avoids the generic compliance claims and missing accessibility proof that caused the CivicWorks (PROP-002) and ShopSphere losses.\n- Verified Evidence: Attached SOC2 Type II audit report, independent penetration test attestations, and named SLA owner before contract sign-off.`,
      injectedLesson: 'CivicWorks (PROP-002): Generic compliance language and lack of concrete evidence weakened the proposal score.',
      critique: 'Enterprise Grade: Eliminates evaluation traps that generic AI models unknowingly repeat.'
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
          Evolutionary Intelligence
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          How ProposalIQ Learns Over Time
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Every proposal outcome becomes organizational memory. Over time, ProposalIQ becomes more aligned with how your organization wins proposals.
        </p>
      </div>

      {/* 3-Stage Visual Learning Curve */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400">STAGE 01</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Initial State
            </span>
          </div>
          <div>
            <h3 className="font-bold text-base text-white">First Proposal</h3>
            <p className="text-xs font-semibold text-indigo-300 mt-0.5">RFP-only generic response</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            No organizational proposal history is available yet. The response is strictly bounded by the uploaded text prompt without historical proof points.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">STAGE 02</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              Context Ingestion
            </span>
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Several Proposal Cycles</h3>
            <p className="text-xs font-semibold text-emerald-300 mt-0.5">Wins & losses shape new drafts</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Wins, losses, and client feedback start shaping future drafts. Past winning frameworks (such as pilot structures) are automatically surfaced.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 relative space-y-4 shadow-lg shadow-indigo-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-400">STAGE 03</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Institutional Asset
            </span>
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Repeated Use</h3>
            <p className="text-xs font-semibold text-purple-300 mt-0.5">Accumulated organizational memory</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The bid desk reuses accumulated institutional knowledge instead of starting from scratch. When top writers leave, the memory remains permanently retained.
          </p>
        </div>
      </div>

      {/* Opinionated Core Insights Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-8 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Core Engineering Philosophy</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Losses Are High-Signal Memory</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Most AI tools only learn from winning examples. We treat proposal losses as higher-signal negative memory to prevent repeated bidding mistakes."
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Preference Over Document Search</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Client preference memory beats generic document search. Remembering that banking buyers penalize vague SLAs is 10x more valuable than matching text similarity."
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Active Loss Language Refusal</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              "The agent actively refuses to reuse proposal phrasing or structures that previously resulted in disqualifications."
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Progressive Learning Simulation */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              Interactive Simulation
            </span>
            <h3 className="text-lg font-bold text-white">
              Watch ProposalIQ Evolve in 3 Iterations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click through each stage to observe how retained memory directly transforms the output.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            {progressionData.map((p, idx) => (
              <button
                key={p.step}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeStep === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.step} {p.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Step Card */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                Iteration {progressionData[activeStep].step}
              </span>
              <h4 className="text-base font-bold text-white">
                {progressionData[activeStep].title}
              </h4>
              <p className="text-xs text-slate-400">
                {progressionData[activeStep].subtitle}
              </p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              {progressionData[activeStep].critique}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {progressionData[activeStep].description}
          </p>

          {progressionData[activeStep].injectedLesson && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Recalled Hindsight Lesson:</strong>
                {progressionData[activeStep].injectedLesson}
              </div>
            </div>
          )}

          {/* Code/Proposal Output Comparison */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Generated Proposal Language (Excerpt):
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {progressionData[activeStep].sampleSnippet}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Persistent organizational memory prevents your proposal quality from resetting back to zero.
          </span>
          <button
            onClick={() => setActiveTab('analyze')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <span>Test with an RFP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
