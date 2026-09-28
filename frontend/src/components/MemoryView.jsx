import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Sparkles,
  Database,
  Building2,
  ShieldCheck,
  Award,
  Layers,
  Loader2
} from 'lucide-react';
import { seedHindsightBank, recordOutcome } from '../api';

export default function MemoryView({
  memories,
  healthInfo,
  onRefreshMemories,
  onOutcomeRecorded
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'won' | 'lost'
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // New Memory Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newIndustry, setNewIndustry] = useState('Technology');
  const [newOutcome, setNewOutcome] = useState('won');
  const [newLesson, setNewLesson] = useState('');
  const [newApproach, setNewApproach] = useState('');
  const [savingMemory, setSavingMemory] = useState(false);

  const wins = memories.filter((m) => String(m.outcome).toLowerCase() === 'won');
  const losses = memories.filter((m) => String(m.outcome).toLowerCase() === 'lost');

  const filteredMemories = memories.filter((m) => {
    const outcomeMatch =
      filter === 'all' || String(m.outcome).toLowerCase() === filter;

    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      String(m.client || '').toLowerCase().includes(query) ||
      String(m.project || '').toLowerCase().includes(query) ||
      String(m.industry || '').toLowerCase().includes(query) ||
      String(m.lessons || '').toLowerCase().includes(query) ||
      String(m.approach || '').toLowerCase().includes(query) ||
      String(m.id || '').toLowerCase().includes(query);

    return outcomeMatch && searchMatch;
  });

  const handleSyncHindsight = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await seedHindsightBank();
      setSyncMessage(res.message);
      if (onRefreshMemories) onRefreshMemories();
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newClient.trim() || !newLesson.trim()) {
      alert('Please fill in client name and lesson learned.');
      return;
    }
    setSavingMemory(true);
    try {
      const res = await recordOutcome({
        client: newClient.trim(),
        project: newProject.trim() || 'Custom Solution',
        industry: newIndustry,
        outcome: newOutcome,
        lessons: newLesson.trim(),
        approach: newApproach.trim() || 'Tailored delivery framework',
      });
      setShowAddModal(false);
      setNewClient('');
      setNewProject('');
      setNewLesson('');
      setNewApproach('');
      if (onOutcomeRecorded) onOutcomeRecorded(res.record);
    } catch (err) {
      alert(`Failed to retain memory: ${err.message}`);
    } finally {
      setSavingMemory(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
            Persistent Institutional Memory
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Organizational Memory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            ProposalIQ remembers what worked, what didn't, and why.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Retain New Outcome</span>
          </button>

          <button
            onClick={handleSyncHindsight}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            {syncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Hindsight...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Hindsight Bank</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Alert */}
      {syncMessage && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-indigo-400/80 hover:text-indigo-200 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Memory Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Total Memories</span>
            <Database className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {memories.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Retained in organizational memory</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
            <span>Successful (Wins)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {wins.length}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-1">What won deals and why</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-400 font-medium mb-1">
            <span>Unsuccessful (Losses)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 tracking-tight">
            {losses.length}
          </div>
          <p className="text-[11px] text-rose-500/80 mt-1">Loss traps avoided</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-medium mb-1">
            <span>Cloud Bank Status</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white tracking-tight truncate">
            {healthInfo?.hindsight?.bank_id || 'proposal-iq-demo'}
          </div>
          <p className="text-[11px] text-indigo-400/80 mt-1">
            {healthInfo?.hindsight?.configured ? '● Live Hindsight Connected' : 'Local Demo Active'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({memories.length})
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg transition-all ${
              filter === 'won'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Won ({wins.length})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg transition-all ${
              filter === 'lost'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lost ({losses.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, industry, or lesson..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMemories.map((mem) => {
          const isWon = String(mem.outcome).toLowerCase() === 'won';
          return (
            <div
              key={mem.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isWon
                  ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {mem.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isWon
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isWon ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{isWon ? 'SUCCESSFUL' : 'UNSUCCESSFUL'}</span>
                  </span>
                </div>

                {/* Client & Project */}
                <div>
                  <h3 className="font-bold text-base text-white">{mem.client}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <span className="text-indigo-400 font-medium">{mem.industry}</span>
                    <span>•</span>
                    <span className="truncate">{mem.project}</span>
                  </div>
                </div>

                {/* Approach */}
                {mem.approach && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {isWon ? 'Proven Approach' : 'Flawed Approach'}
                    </span>
                    <p className="text-slate-300 leading-snug">{mem.approach}</p>
                  </div>
                )}

                {/* Lesson Learned */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    isWon
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                      isWon ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isWon ? 'Key Winning Factor' : 'Critical Loss Lesson'}
                  </span>
                  <p className="leading-relaxed font-medium">"{mem.lessons}"</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-slate-400" />
                  <span>Hindsight Bank</span>
                </span>
                <span className="font-mono text-slate-400">
                  {healthInfo?.hindsight?.bank_id || 'proposal-iq-demo'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
          No proposal memories match your filter criteria.
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Retain Historical Memory</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Apex Health"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Industry</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Banking">Banking</option>
                    <option value="Government">Government</option>
                    <option value="Retail">Retail</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="e.g. Digital Portal Modernization"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewOutcome('won')}
                    className={`p-2.5 rounded-xl border font-bold ${
                      newOutcome === 'won'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    WON DEAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOutcome('lost')}
                    className={`p-2.5 rounded-xl border font-bold ${
                      newOutcome === 'lost'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    LOST DEAL
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Approach Used</label>
                <input
                  type="text"
                  value={newApproach}
                  onChange={(e) => setNewApproach(e.target.value)}
                  placeholder="e.g. Phased rollout with security review and early pilot."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Key Lesson</label>
                <textarea
                  rows={3}
                  required
                  value={newLesson}
                  onChange={(e) => setNewLesson(e.target.value)}
                  placeholder="What should ProposalIQ remember to do or avoid?"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMemory}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {savingMemory ? 'Retaining...' : 'Retain in Hindsight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
