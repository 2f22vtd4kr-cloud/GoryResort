import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, TrendingUp, Mountain, Compass, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type PersonaKey = 'investor' | 'skier' | 'tourist';
type SimState = 'idle' | 'loading' | 'results' | 'error';

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

const PERSONAS = [
  {
    id: 'investor' as PersonaKey,
    label: 'INVESTOR',
    sublabel: 'High-net-worth / Family Office',
    description: "Evaluating pre-opening resort investment. Focused on IRR credibility, exit strategy, legal clarity, and management track record. Has seen many pitches — won't be impressed by vague projections.",
    icon: TrendingUp,
  },
  {
    id: 'skier' as PersonaKey,
    label: 'SKIER',
    sublabel: 'Avid Skier — Verbier / Val d\'Isère',
    description: 'Travels to world-class Alps resorts 2–3 times a year. Cares deeply about vertical drop, terrain variety, snow reliability, and lift system quality. Will compare everything to Courchevel.',
    icon: Mountain,
  },
  {
    id: 'tourist' as PersonaKey,
    label: 'TRAVELLER',
    sublabel: 'Affluent Luxury Tourist',
    description: 'Affluent couple or family seeking a premium winter experience. Priorities: getting there easily, accommodation quality, dining, wellness, and non-ski activities for the whole group.',
    icon: Compass,
  },
];

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  const color = score >= 7 ? '#4ade80' : score >= 5 ? '#facc15' : '#f87171';
  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
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

export function SimulatorPage() {
  const [selected, setSelected] = useState<PersonaKey | null>(null);
  const [state, setState] = useState<SimState>('idle');
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const apiBase = '/api-server';
  const siteBase = import.meta.env.BASE_URL;

  const runSim = async () => {
    if (!selected) return;
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data as SimulateResult);
      setState('results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setErrorMsg(msg);
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setErrorMsg('');
  };

  const avgScore = result
    ? Math.round(result.sections.reduce((s, sec) => s + sec.score, 0) / result.sections.length * 10) / 10
    : null;

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F5F5F0] font-sans antialiased">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0A0C0E]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <a
            href={siteBase}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Resort
          </a>
          <span className="font-display text-2xl tracking-[0.3em] text-white select-none">GORY</span>
          <span className="text-xs uppercase tracking-widest text-[#2A5F6F]">Simulator</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* ── Title ─────────────────────────────────────────── */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.35em] text-white/30 uppercase mb-4">Research Tool · AI-Powered</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-[0.1em] text-white mb-6 leading-none">
            USER<br/>SIMULATOR
          </h1>
          <p className="text-white/50 font-serif text-base md:text-lg max-w-xl leading-relaxed">
            Select a visitor persona. Gemini AI reads every section of the resort website through that person's eyes and reports back — frankly.
          </p>
        </div>

        {/* ── Persona Cards ─────────────────────────────────── */}
        {state !== 'results' && (
          <div className="mb-12">
            <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">01 — Choose Persona</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const active = selected === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className={`text-left p-7 border transition-all duration-300 ${
                      active
                        ? 'border-[#2A5F6F] bg-[#2A5F6F]/10 shadow-[0_0_40px_rgba(42,95,111,0.15)]'
                        : 'border-white/8 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`mb-5 transition-colors ${active ? 'text-[#2A5F6F]' : 'text-white/25'}`}
                    />
                    <div className={`font-display text-xl tracking-widest mb-1 transition-colors ${active ? 'text-white' : 'text-white/50'}`}>
                      {p.label}
                    </div>
                    <div className={`text-[10px] uppercase tracking-widest mb-4 transition-colors ${active ? 'text-[#2A5F6F]' : 'text-white/20'}`}>
                      {p.sublabel}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{p.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Run Button ────────────────────────────────────── */}
        {(state === 'idle' || state === 'error') && (
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">02 — Run</p>
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 border border-red-500/20 bg-red-500/5 text-red-400 text-sm"
              >
                ⚠ {errorMsg}
              </motion.div>
            )}
            <motion.button
              onClick={runSim}
              disabled={!selected}
              whileHover={{ scale: selected ? 1.02 : 1 }}
              whileTap={{ scale: selected ? 0.97 : 1 }}
              className={`flex items-center gap-3 px-10 py-4 text-sm uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                selected
                  ? 'bg-white text-black hover:bg-[#2A5F6F] hover:text-white cursor-pointer'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <Play size={14} />
              Run Simulation
            </motion.button>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────── */}
        {state === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 gap-10"
          >
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

        {/* ── Results ───────────────────────────────────────── */}
        {state === 'results' && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Results header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-12 border-b border-white/5">
              <div>
                <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-3">Simulation Complete</p>
                <h2 className="font-display text-4xl md:text-6xl tracking-widest text-white leading-none mb-2">
                  {result.persona.toUpperCase()}
                </h2>
                {avgScore !== null && (
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-xs text-white/30 uppercase tracking-wider">Average Section Score</span>
                    <span className={`text-lg font-bold ${avgScore >= 7 ? 'text-green-400' : avgScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {avgScore}/10
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 hover:text-white border border-white/8 hover:border-white/20 px-5 py-3 transition-all self-start md:self-auto"
              >
                <RefreshCw size={12} />
                New Simulation
              </button>
            </div>

            {/* Section cards */}
            <div className="mb-16 space-y-3">
              <p className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Section Analysis</p>
              {result.sections.map((sec, i) => (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-white/8 p-5 md:p-7 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start gap-5">
                    <ScoreRing score={sec.score} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-display text-lg tracking-widest text-white">{sec.title.toUpperCase()}</h3>
                        <ScoreBadge score={sec.score} />
                      </div>
                      <p className="text-white/55 font-serif text-sm leading-relaxed mb-4 italic">
                        "{sec.perception}"
                      </p>
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

            {/* Overall verdict */}
            <div className="border border-[#2A5F6F]/25 bg-[#2A5F6F]/5 p-8 md:p-12 mb-6">
              <p className="text-xs tracking-[0.3em] text-[#2A5F6F] uppercase mb-6">Overall Verdict</p>
              <p className="font-serif text-white/80 text-base md:text-lg leading-relaxed mb-10">
                {result.overall.summary}
              </p>
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

            {/* Translation issues */}
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
                      {issue.suggested && (
                        <p className="text-xs text-[#4A9FBF]">→ {issue.suggested}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

      </div>
    </div>
  );
}
