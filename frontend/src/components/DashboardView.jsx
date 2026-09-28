import React from 'react';
import {
  FileSearch,
  Brain,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  History,
  AlertTriangle
} from 'lucide-react';

export default function DashboardView({
  stats,
  memories,
  setActiveTab,
  onLoadSample
}) {
  const total = stats?.total_proposals || memories?.length || 0;
  const won = stats?.successful_proposals ?? memories?.filter(m => String(m.outcome).toLowerCase() === 'won').length ?? 0;
  const lost = stats?.unsuccessful_proposals ?? memories?.filter(m => String(m.outcome).toLowerCase() === 'lost').length ?? 0;
  const winRate = stats?.win_rate ?? (total > 0 ? ((won / total) * 100).toFixed(1) : 0);
  const memoryItems = stats?.memory_items || total;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 lg:p-10 shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Persistent Organizational Memory Engine</span>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Turn every RFP into a smarter proposal.
          </h1>
          
          <p className="text-base lg:text-lg text-slate-300 font-normal leading-relaxed">
            Proposal intelligence that remembers what worked, learns from outcomes, and improves every proposal.
          </p>

          {/* Pain point kicker */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-200">The Institutional Knowledge Drain:</strong> When top proposal writers move on, teams lose years of win/loss context. ProposalIQ turns every past evaluation into searchable, persistent Hindsight memory.
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('analyze')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analyze an RFP</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all shadow-sm"
            >
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>View Memory ({memoryItems})</span>
            </button>

            <button
              onClick={onLoadSample}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-medium text-xs border border-indigo-800/50 transition-all ml-auto"
            >
              <span>Load FinCore Bank Demo RFP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Total Proposals</span>
            <History className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{total}</div>
          <p className="text-[11px] text-slate-500 mt-1">In institutional index</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
            <span>Successful Proposals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{won}</div>
          <p className="text-[11px] text-emerald-500/80 mt-1">Winning patterns retained</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-400 font-medium mb-1">
            <span>Unsuccessful Proposals</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{lost}</div>
          <p className="text-[11px] text-rose-500/80 mt-1">Loss traps avoided</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-medium mb-1">
            <span>Historical Win Rate</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{winRate}%</div>
          <p className="text-[11px] text-indigo-400/80 mt-1">From real proposal history</p>
        </div>

        <div className="col-span-2 md:col-span-1 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
            <span>Hindsight Memories</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{memoryItems}</div>
          <p className="text-[11px] text-purple-400/80 mt-1">Synced to cloud bank</p>
        </div>
      </div>

      {/* Core Insights / Architecture Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Brain className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-white">Losses Teach More Than Wins</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Standard AI only looks for positive matches. ProposalIQ treats past lost bids (e.g. CivicWorks, ShopSphere) as negative guardrails to eliminate vague compliance wording.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-white">Concrete Governance Injection</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Recalling NorthStar Health and FinCore Bank bids automatically injects named security ownership, signed audit attestations, and a 6-week controlled pilot framework.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-white">Continuous Feedback Loop</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Record every generated proposal as Won or Lost. Add the deal lesson, and Hindsight Cloud ensures future proposals immediately benefit from what was learned.
          </p>
        </div>
      </div>

      {/* Historical Proposals Preview */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Historical Proposals & Memories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real seeded institutional knowledge stored in Hindsight Cloud</p>
          </div>
          <button
            onClick={() => setActiveTab('memory')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View all {total} memories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {memories.slice(0, 5).map((mem) => {
            const isWon = String(mem.outcome).toLowerCase() === 'won';
            return (
              <div key={mem.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-indigo-400">{mem.id}</span>
                    <span className="font-semibold text-sm text-white">{mem.client}</span>
                    <span className="text-xs text-slate-500 font-medium">• {mem.industry}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{mem.project}</p>
                  <p className="text-xs text-slate-400 italic line-clamp-1">"{mem.lessons}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isWon
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isWon ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{isWon ? 'WON' : 'LOST'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
