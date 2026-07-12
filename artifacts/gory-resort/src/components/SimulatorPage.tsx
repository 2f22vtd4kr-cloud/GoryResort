import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, TrendingUp, Mountain, Compass, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Zap, Loader2, Check, Lightbulb,
} from 'lucide-react';

type PersonaKey = 'investor' | 'skier' | 'tourist';
type Mode = 'single' | 'all';
type SingleState = 'idle' | 'loading' | 'results' | 'error';
type PersonaLoadState = 'idle' | 'loading' | 'done' | 'error';
type ImprovState = 'idle' | 'loading' | 'done' | 'error';

interface SectionAnalysis {
  id: string;
  title: string;
  perception: string;
  strengths: string[];
  concerns: string[];
  score: number;
}

interface SimulateOverall {
  summary: string;
  topIssues: string[];
  recommendation: string;
}

interface TranslationIssue {
  key: string;
  issue: string;
  suggested: string;
}

interface SimulateResult {
  persona: string;
  sections: SectionAnalysis[];
  overall: SimulateOverall;
  translationIssues?: TranslationIssue[];
}

interface PersonaRunState {
  loadState: PersonaLoadState;
  result: SimulateResult | null;
  error?: string;
}

interface ImprovementItem {
  sectionId: string;
  sectionTitle: string;
  priority: 1 | 2 | 3;
  concern: string;
  personas: string[];
  field: string;
  improvement: string;
}

interface ImprovementResult {
  summary: string;
  improvements: ImprovementItem[];
}

const PERSONAS = [
  {
    id: 'investor' as PersonaKey,
    label: 'INVESTOR',
    sublabel: 'High-net-worth / Family Office',
    description: "Evaluating pre-opening resort investment. Focused on IRR credibility, exit strategy, legal clarity, and management track record. Has seen many pitches — won't be impressed by vague projections.",
    icon: TrendingUp,
    color: '#4A9FBF',
  },
  {
    id: 'skier' as PersonaKey,
    label: 'SKIER',
    sublabel: "Avid Skier — Verbier / Val d'Isère",
    description: 'Travels to world-class Alps resorts 2–3 times a year. Cares deeply about vertical drop, terrain variety, snow reliability, and lift system quality. Will compare everything to Courchevel.',
    icon: Mountain,
    color: '#6DB8A8',
  },
  {
    id: 'tourist' as PersonaKey,
    label: 'TRAVELLER',
    sublabel: 'Affluent Luxury Tourist',
    description: 'Affluent couple or family seeking a premium winter experience. Priorities: getting there easily, accommodation quality, dining, wellness, and non-ski activities for the whole group.',
    icon: Compass,
    color: '#9B8FC4',
  },
];

const SECTION_ORDER = ['hero', 'vision', 'ski', 'stay', 'experiences', 'investment', 'gallery', 'contact'];
const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero', vision: 'Vision', ski: 'The Mountain', stay: 'Sanctuary',
  experiences: 'Experiences', investment: 'Investment', gallery: 'Gallery', contact: 'Connect',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const color = score >= 7 ? '#4ade80' : score >= 5 ? '#facc15' : '#f87171';
  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 7) return <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 uppercase tracking-wider">STRONG</span>;
  if (score >= 5) return <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 uppercase tracking-wider">FAIR</span>;
  return <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 uppercase tracking-wider">WEAK</span>;
}

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <td className="py-3 px-3 text-white/15 text-center text-xs">—</td>;
  }
  const color = score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const bg = score >= 7 ? 'bg-green-500/8' : score >= 5 ? 'bg-yellow-500/5' : 'bg-red-500/8';
  return <td className={`py-3 px-3 text-center text-sm font-bold ${color} ${bg}`}>{score}</td>;
}

function PersonaResultPanel({ result }: { result: SimulateResult }) {
  const avgScore = Math.round(result.sections.reduce((s, sec) => s + sec.score, 0) / result.sections.length * 10) / 10;
  return (
    <div>
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
        <span className={`text-lg font-bold ${avgScore >= 7 ? 'text-green-400' : avgScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
          {avgScore}/10
        </span>
        <span className="text-xs text-white/30 uppercase tracking-wider">Average section score</span>
      </div>

      <div className="mb-12 space-y-3">
        <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Section Analysis</p>
        {result.sections.map((sec, i) => (
          <motion.div key={sec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="border border-white/8 p-5 md:p-7 hover:border-white/15 transition-colors">
            <div className="flex items-start gap-5">
              <ScoreRing score={sec.score} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-display text-lg tracking-widest text-white">{sec.title.toUpperCase()}</h3>
                  <ScoreBadge score={sec.score} />
                </div>
                <p className="text-white/55 font-serif text-sm leading-relaxed mb-4 italic">"{sec.perception}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.strengths.length > 0 && (
                    <div>
                      <p className="text-[10px] text-green-400/60 uppercase tracking-widest mb-2">Strengths</p>
                      {sec.strengths.map((s, j) => (
                        <div key={j} className="flex items-start gap-2 mb-1.5">
                          <CheckCircle2 size={11} className="text-green-400/50 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-white/50 leading-relaxed">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {sec.concerns.length > 0 && (
                    <div>
                      <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2">Concerns</p>
                      {sec.concerns.map((c, j) => (
                        <div key={j} className="flex items-start gap-2 mb-1.5">
                          <XCircle size={11} className="text-red-400/50 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-white/50 leading-relaxed">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border border-[#2A5F6F]/25 bg-[#2A5F6F]/5 p-8 md:p-12 mb-6">
        <p className="text-xs tracking-[0.3em] text-[#2A5F6F] uppercase mb-6">Overall Verdict</p>
        <p className="font-serif text-white/80 text-base md:text-lg leading-relaxed mb-10">{result.overall.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-4">Top Issues</p>
            {result.overall.topIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <AlertTriangle size={12} className="text-red-400/50 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60 leading-relaxed">{issue}</span>
              </div>
            ))}
          </div>
          <div className="md:border-l border-white/8 md:pl-12">
            <p className="text-[10px] text-[#2A5F6F] uppercase tracking-widest mb-4">Recommendation</p>
            <p className="text-sm text-white/60 leading-relaxed">{result.overall.recommendation}</p>
          </div>
        </div>
      </div>

      {result.translationIssues && result.translationIssues.length > 0 && (
        <div className="border border-yellow-500/15 bg-yellow-500/3 p-8 md:p-10">
          <p className="text-xs tracking-[0.3em] text-yellow-400/60 uppercase mb-6">
            Russian Translation Issues — {result.translationIssues.length} found
          </p>
          <div className="space-y-5">
            {result.translationIssues.map((issue, i) => (
              <div key={i} className="border-l-2 border-yellow-500/20 pl-4">
                <p className="text-[10px] text-yellow-400/50 font-mono mb-1 uppercase">{issue.key}</p>
                <p className="text-xs text-white/50 leading-relaxed mb-1">{issue.issue}</p>
                {issue.suggested && <p className="text-xs text-[#4A9FBF]">→ {issue.suggested}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function SimulatorPage() {
  const [mode, setMode] = useState<Mode>('all');

  // Single mode
  const [selected, setSelected] = useState<PersonaKey | null>(null);
  const [singleState, setSingleState] = useState<SingleState>('idle');
  const [singleResult, setSingleResult] = useState<SimulateResult | null>(null);
  const [singleError, setSingleError] = useState('');

  // All mode
  const [personaStates, setPersonaStates] = useState<Record<PersonaKey, PersonaRunState>>({
    investor: { loadState: 'idle', result: null },
    skier:    { loadState: 'idle', result: null },
    tourist:  { loadState: 'idle', result: null },
  });
  const [allHasRun, setAllHasRun] = useState(false);
  const [activeTab, setActiveTab] = useState<PersonaKey | 'synthesis'>('investor');

  // Improvements
  const [improvState, setImprovState] = useState<ImprovState>('idle');
  const [improvements, setImprovements] = useState<ImprovementResult | null>(null);
  const [improvError, setImprovError] = useState('');

  const apiBase = '/api-server';
  const siteBase = import.meta.env.BASE_URL;

  const isRunning  = Object.values(personaStates).some(p => p.loadState === 'loading');
  const allFinished = Object.values(personaStates).every(p => p.loadState === 'done' || p.loadState === 'error');
  const doneCount  = Object.values(personaStates).filter(p => p.loadState === 'done').length;
  const doneResults = (Object.values(personaStates).filter(p => p.result !== null) as { result: SimulateResult }[]).map(p => p.result);

  // Helpers for synthesis table
  const getSectionScore = (key: PersonaKey, sectionId: string): number | null => {
    const r = personaStates[key].result;
    if (!r) return null;
    return r.sections.find(s => s.id === sectionId)?.score ?? null;
  };
  const getAvgScore = (sectionId: string): number | null => {
    const scores = PERSONAS.map(p => getSectionScore(p.id, sectionId)).filter((s): s is number => s !== null);
    if (!scores.length) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const runAll = async () => {
    setAllHasRun(true);
    setPersonaStates({
      investor: { loadState: 'loading', result: null },
      skier:    { loadState: 'loading', result: null },
      tourist:  { loadState: 'loading', result: null },
    });
    setImprovements(null);
    setImprovState('idle');
    setActiveTab('investor');

    const runPersona = async (key: PersonaKey) => {
      try {
        const res = await fetch(`${apiBase}/api/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona: key }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setPersonaStates(prev => ({ ...prev, [key]: { loadState: 'done', result: data as SimulateResult } }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Simulation failed';
        setPersonaStates(prev => ({ ...prev, [key]: { loadState: 'error', result: null, error: msg } }));
      }
    };

    await Promise.all([runPersona('investor'), runPersona('skier'), runPersona('tourist')]);
  };

  const runSingle = async () => {
    if (!selected) return;
    setSingleState('loading');
    setSingleError('');
    try {
      const res = await fetch(`${apiBase}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSingleResult(data as SimulateResult);
      setSingleState('results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setSingleError(msg);
      setSingleState('error');
    }
  };

  const generateImprovements = async () => {
    if (!doneResults.length) return;
    setImprovState('loading');
    setImprovError('');
    try {
      const res = await fetch(`${apiBase}/api/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: doneResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setImprovements(data as ImprovementResult);
      setImprovState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate improvements';
      setImprovError(msg);
      setImprovState('error');
    }
  };

  const resetAll = () => {
    setPersonaStates({
      investor: { loadState: 'idle', result: null },
      skier:    { loadState: 'idle', result: null },
      tourist:  { loadState: 'idle', result: null },
    });
    setAllHasRun(false);
    setImprovements(null);
    setImprovState('idle');
    setActiveTab('investor');
  };

  const resetSingle = () => {
    setSingleState('idle');
    setSingleResult(null);
    setSingleError('');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F5F5F0] font-sans antialiased">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0A0C0E]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <a href={siteBase} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest">
            <ArrowLeft size={14} />
            Back to Resort
          </a>
          <span className="font-display text-2xl tracking-[0.3em] text-white select-none">GORY</span>
          <span className="text-xs uppercase tracking-widest text-[#2A5F6F]">Simulator</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* Title */}
        <div className="mb-14">
          <p className="text-xs tracking-[0.35em] text-white/30 uppercase mb-4">Research Tool · AI-Powered</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-[0.1em] text-white mb-6 leading-none">
            USER<br/>SIMULATOR
          </h1>
          <p className="text-white/50 font-serif text-base md:text-lg max-w-xl leading-relaxed">
            Gemini AI reads every section of the resort website through the eyes of each visitor persona — and reports back frankly.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-12">
          <div className="inline-flex border border-white/10">
            <button
              onClick={() => { setMode('single'); resetSingle(); }}
              className={`px-6 py-3 text-xs uppercase tracking-widest transition-all duration-200 ${mode === 'single' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              Single Persona
            </button>
            <button
              onClick={() => { setMode('all'); resetAll(); }}
              className={`px-6 py-3 text-xs uppercase tracking-widest transition-all duration-200 ${mode === 'all' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              All Personas
            </button>
          </div>
        </div>

        {/* ─── SINGLE MODE ─────────────────────────────────────────────────── */}
        {mode === 'single' && (
          <>
            {singleState !== 'results' && (
              <div className="mb-12">
                <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">01 — Choose Persona</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const active = selected === p.id;
                    return (
                      <motion.button key={p.id} onClick={() => setSelected(p.id)} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                        className={`text-left p-7 border transition-all duration-300 ${active ? 'border-[#2A5F6F] bg-[#2A5F6F]/10 shadow-[0_0_40px_rgba(42,95,111,0.15)]' : 'border-white/8 hover:border-white/20 bg-white/[0.02]'}`}>
                        <Icon size={20} className={`mb-5 transition-colors ${active ? 'text-[#2A5F6F]' : 'text-white/25'}`} />
                        <div className={`font-display text-xl tracking-widest mb-1 transition-colors ${active ? 'text-white' : 'text-white/50'}`}>{p.label}</div>
                        <div className={`text-[10px] uppercase tracking-widest mb-4 transition-colors ${active ? 'text-[#2A5F6F]' : 'text-white/20'}`}>{p.sublabel}</div>
                        <p className="text-xs text-white/40 leading-relaxed">{p.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {(singleState === 'idle' || singleState === 'error') && (
              <div className="mb-16">
                <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">02 — Run</p>
                {singleState === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 px-4 py-3 border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                    ⚠ {singleError}
                  </motion.div>
                )}
                <motion.button onClick={runSingle} disabled={!selected} whileHover={{ scale: selected ? 1.02 : 1 }} whileTap={{ scale: selected ? 0.97 : 1 }}
                  className={`flex items-center gap-3 px-10 py-4 text-sm uppercase tracking-[0.2em] font-bold transition-all duration-300 ${selected ? 'bg-white text-black hover:bg-[#2A5F6F] hover:text-white cursor-pointer' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
                  <Play size={14} />
                  Run Simulation
                </motion.button>
              </div>
            )}

            {singleState === 'loading' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 gap-10">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border border-white/5" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#2A5F6F] animate-spin" style={{ animationDuration: '1.2s' }} />
                  <div className="absolute inset-3 rounded-full border-t border-[#4A9FBF]/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                </div>
                <div className="text-center space-y-2">
                  <div className="font-display text-2xl tracking-[0.2em] text-white">ANALYSING</div>
                  <div className="text-xs text-white/30 tracking-wider">Gemini is walking through the site as {PERSONAS.find(p => p.id === selected)?.label}…</div>
                  <div className="text-xs text-white/20">This may take 20–40 seconds</div>
                </div>
              </motion.div>
            )}

            {singleState === 'results' && singleResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-12 border-b border-white/5">
                  <div>
                    <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-3">Simulation Complete</p>
                    <h2 className="font-display text-4xl md:text-6xl tracking-widest text-white leading-none mb-2">{singleResult.persona.toUpperCase()}</h2>
                  </div>
                  <button onClick={resetSingle} className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 hover:text-white border border-white/8 hover:border-white/20 px-5 py-3 transition-all self-start md:self-auto">
                    <RefreshCw size={12} />New Simulation
                  </button>
                </div>
                <PersonaResultPanel result={singleResult} />
              </motion.div>
            )}
          </>
        )}

        {/* ─── ALL MODE ─────────────────────────────────────────────────────── */}
        {mode === 'all' && (
          <>
            {/* Pre-run + during run: persona status cards */}
            {(!allHasRun || isRunning) && (
              <>
                <div className="mb-12">
                  <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">
                    {isRunning ? 'Running in Parallel…' : 'All Personas — Simultaneous'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const ps = personaStates[p.id];
                      const isDone  = ps.loadState === 'done';
                      const isError = ps.loadState === 'error';
                      const isLoad  = ps.loadState === 'loading';
                      const avg = isDone && ps.result
                        ? Math.round(ps.result.sections.reduce((s, sec) => s + sec.score, 0) / ps.result.sections.length * 10) / 10
                        : null;
                      return (
                        <div key={p.id} className={`p-7 border transition-all duration-500 ${isDone ? 'border-green-500/20 bg-green-500/3' : isError ? 'border-red-500/20 bg-red-500/3' : isLoad ? 'border-[#2A5F6F]/40 bg-[#2A5F6F]/5' : 'border-white/8 bg-white/[0.02]'}`}>
                          <div className="flex items-start justify-between mb-5">
                            <Icon size={20} className={isDone ? 'text-green-400' : isError ? 'text-red-400' : isLoad ? 'text-[#2A5F6F]' : 'text-white/25'} />
                            {isLoad  && <Loader2 size={14} className="text-[#2A5F6F] animate-spin" />}
                            {isDone  && <Check   size={14} className="text-green-400" />}
                            {isError && <XCircle size={14} className="text-red-400" />}
                          </div>
                          <div className="font-display text-xl tracking-widest mb-1 text-white">{p.label}</div>
                          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3">{p.sublabel}</div>
                          {isLoad  && <p className="text-xs text-[#4A9FBF]/60">Analysing…</p>}
                          {isDone  && avg !== null && <p className="text-xs text-green-400">Complete · avg {avg}/10</p>}
                          {isError && <p className="text-xs text-red-400 truncate">{ps.error}</p>}
                          {ps.loadState === 'idle' && <p className="text-xs text-white/20">Queued</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!isRunning && (
                  <div className="mb-16">
                    <motion.button onClick={runAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-10 py-4 text-sm uppercase tracking-[0.2em] font-bold bg-white text-black hover:bg-[#2A5F6F] hover:text-white transition-all duration-300 cursor-pointer">
                      <Zap size={14} />
                      Run All Personas
                    </motion.button>
                    <p className="text-xs text-white/20 mt-3">3 parallel Gemini calls · 30–60 seconds total</p>
                  </div>
                )}

                {isRunning && (
                  <div className="mb-8">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">{doneCount} / 3 complete</p>
                    <div className="h-px bg-white/5 relative overflow-hidden">
                      <motion.div className="absolute inset-y-0 left-0 bg-[#2A5F6F]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(doneCount / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Post-run results with tabs */}
            {allHasRun && !isRunning && allFinished && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-10">
                  <p className="text-xs tracking-[0.3em] text-white/30 uppercase">
                    Simulation Complete · {doneCount}/3 Personas
                  </p>
                  <button onClick={resetAll} className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 hover:text-white border border-white/8 hover:border-white/20 px-5 py-3 transition-all">
                    <RefreshCw size={12} />Run Again
                  </button>
                </div>

                {/* Tab bar */}
                <div className="flex flex-wrap border-b border-white/8 mb-10">
                  {PERSONAS.map((p) => {
                    const isDone   = personaStates[p.id].loadState === 'done';
                    const isActive = activeTab === p.id;
                    return (
                      <button key={p.id} onClick={() => setActiveTab(p.id)} disabled={!isDone}
                        className={`px-5 py-4 text-xs uppercase tracking-widest border-b-2 transition-all -mb-px ${isActive ? 'border-white text-white' : isDone ? 'border-transparent text-white/40 hover:text-white/70' : 'border-transparent text-white/15 cursor-not-allowed'}`}>
                        {p.label}
                      </button>
                    );
                  })}
                  <button onClick={() => setActiveTab('synthesis')}
                    className={`px-5 py-4 text-xs uppercase tracking-widest border-b-2 transition-all -mb-px flex items-center gap-2 ${activeTab === 'synthesis' ? 'border-[#2A5F6F] text-[#4A9FBF]' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                    <Lightbulb size={11} />Synthesis
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Persona result tabs */}
                  {PERSONAS.map((p) => {
                    const ps = personaStates[p.id];
                    if (activeTab !== p.id || !ps.result) return null;
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <PersonaResultPanel result={ps.result} />
                      </motion.div>
                    );
                  })}

                  {/* Synthesis tab */}
                  {activeTab === 'synthesis' && (
                    <motion.div key="synthesis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                      {/* Score heatmap */}
                      <div className="mb-12">
                        <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Section Scores — All Personas</p>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/8">
                                <th className="text-left py-3 px-3 text-[10px] text-white/25 uppercase tracking-widest">Section</th>
                                {PERSONAS.map(p => (
                                  <th key={p.id} className="py-3 px-3 text-[10px] text-white/25 uppercase tracking-widest text-center">{p.label}</th>
                                ))}
                                <th className="py-3 px-3 text-[10px] text-white/40 uppercase tracking-widest text-center">AVG</th>
                              </tr>
                            </thead>
                            <tbody>
                              {SECTION_ORDER.map(sid => (
                                <tr key={sid} className="border-b border-white/5 hover:bg-white/[0.01]">
                                  <td className="py-3 px-3 text-xs text-white/50">{SECTION_LABELS[sid]}</td>
                                  {PERSONAS.map(p => <ScoreCell key={p.id} score={getSectionScore(p.id, sid)} />)}
                                  <ScoreCell score={getAvgScore(sid)} />
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Aggregated top issues */}
                      <div className="mb-12">
                        <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Top Issues — Across All Personas</p>
                        <div className="space-y-0">
                          {doneResults.flatMap((r, ri) =>
                            r.overall.topIssues.slice(0, 2).map(issue => ({
                              issue,
                              persona: PERSONAS[ri]?.label ?? r.persona,
                            }))
                          ).map(({ issue, persona }, i) => (
                            <div key={i} className="flex items-start gap-4 py-4 border-b border-white/5">
                              <AlertTriangle size={11} className="text-red-400/50 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-white/55 flex-1 leading-relaxed">{issue}</span>
                              <span className="text-[10px] text-white/20 uppercase tracking-wider flex-shrink-0">{persona}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Generate AI Improvements */}
                      <div className="border border-[#2A5F6F]/20 bg-[#2A5F6F]/5 p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                          <div>
                            <p className="text-xs tracking-[0.3em] text-[#2A5F6F] uppercase mb-3">AI Content Improvements</p>
                            <p className="text-white/55 text-sm leading-relaxed max-w-lg">
                              Gemini synthesises feedback from all three personas and generates specific, implementable content improvements — exact copy and data to add to each site section.
                            </p>
                          </div>
                          {improvState !== 'done' && (
                            <motion.button onClick={generateImprovements} disabled={improvState === 'loading'}
                              whileHover={{ scale: improvState === 'loading' ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                              className={`flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold transition-all flex-shrink-0 ${improvState === 'loading' ? 'bg-white/8 text-white/25 cursor-not-allowed' : 'bg-[#2A5F6F] text-white hover:bg-[#4A9FBF] cursor-pointer'}`}>
                              {improvState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                              {improvState === 'loading' ? 'Generating…' : 'Generate Improvements'}
                            </motion.button>
                          )}
                        </div>

                        {improvState === 'error' && (
                          <div className="mb-4 px-4 py-3 border border-red-500/20 bg-red-500/5 text-red-400 text-sm">⚠ {improvError}</div>
                        )}

                        {improvState === 'loading' && (
                          <div className="flex items-center gap-3 text-xs text-white/35">
                            <Loader2 size={12} className="animate-spin" />
                            Gemini is synthesising feedback from all 3 personas…
                          </div>
                        )}

                        {improvState === 'done' && improvements && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="font-serif text-white/65 text-sm leading-relaxed mb-8 italic border-l-2 border-[#2A5F6F]/30 pl-4">
                              {improvements.summary}
                            </p>
                            <div className="space-y-4">
                              {improvements.improvements.map((imp, i) => {
                                const pc = imp.priority === 1
                                  ? 'text-red-400 bg-red-500/8 border-red-500/20'
                                  : imp.priority === 2
                                  ? 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20'
                                  : 'text-[#4A9FBF] bg-[#2A5F6F]/8 border-[#2A5F6F]/20';
                                const pl = imp.priority === 1 ? 'CRITICAL' : imp.priority === 2 ? 'IMPORTANT' : 'ENHANCE';
                                return (
                                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="border border-white/8 p-5 md:p-6 hover:border-white/15 transition-colors">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                      <span className={`text-[10px] px-2 py-0.5 border ${pc} uppercase tracking-widest`}>{pl}</span>
                                      <span className="text-xs text-white/50 font-display tracking-wider">{imp.sectionTitle.toUpperCase()}</span>
                                      <span className="text-[10px] text-white/20">{imp.field}</span>
                                    </div>
                                    <p className="text-xs text-red-400/60 mb-3 leading-relaxed">{imp.concern}</p>
                                    <div className="border-l-2 border-[#2A5F6F]/35 pl-4 mb-3">
                                      <p className="text-[10px] text-[#4A9FBF]/60 uppercase tracking-widest mb-2">Suggested Improvement</p>
                                      <p className="text-sm text-white/65 leading-relaxed">{imp.improvement}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {imp.personas.map(persona => (
                                        <span key={persona} className="text-[10px] text-white/20 border border-white/8 px-2 py-0.5">{persona}</span>
                                      ))}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
