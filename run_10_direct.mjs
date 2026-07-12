#!/usr/bin/env node
// 10-iteration simulator — gemini-2.0-flash-lite, 20s pacing, unbuffered file logging
import { writeFileSync, appendFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const LOG = join(__dir, "sim_run10.log");
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { appendFileSync(LOG, "GEMINI_API_KEY not set\n"); process.exit(1); }

function L(...args) { appendFileSync(LOG, args.join(" ") + "\n"); }

// gemini-2.0-flash-lite has a separate per-model quota from gemini-2.0-flash
const MODEL = "gemini-2.0-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const CALL_GAP_MS = 20000; // 20s → 3 RPM, very safe for any quota scenario

let lastCall = 0;
async function pace() {
  const wait = CALL_GAP_MS - (Date.now() - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
}

async function gemini(prompt, maxTokens = 1800) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    await pace();
    let body;
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, responseMimeType: "application/json" }
        }),
        signal: AbortSignal.timeout(90_000),
      });
      body = await res.json();
    } catch (err) {
      L(`    network err attempt ${attempt}: ${err.message?.slice(0,80)}`);
      if (attempt < 8) { lastCall = 0; await new Promise(r => setTimeout(r, 8000)); continue; }
      throw err;
    }
    if (body.error) {
      const is429 = body.error.code === 429 || body.error.status === "RESOURCE_EXHAUSTED";
      if (is429 && attempt < 8) {
        const ri = body.error.details?.find(d => d["@type"]?.includes("RetryInfo"));
        const delaySec = ri?.retryDelay ? Math.ceil(parseFloat(ri.retryDelay)) : 20;
        const waitMs = Math.max(delaySec * 1000 + 3000, CALL_GAP_MS);
        L(`    429 retryDelay=${ri?.retryDelay ?? "??"} → waiting ${(waitMs/1000).toFixed(0)}s (attempt ${attempt}/8)`);
        lastCall = 0;
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw new Error(`Gemini ${body.error.code}: ${body.error.message?.slice(0,120)}`);
    }
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");
    try { return JSON.parse(text); }
    catch { throw new Error("JSON parse error: " + text.slice(0, 100)); }
  }
}

// ── Personas (compact) ────────────────────────────────────────────────────
const PERSONAS = {
  investor: {
    name: "Experienced Resort Investor",
    desc: "HNWI/family office evaluating pre-opening luxury resort. Has seen dozens of pitches. Skeptical of vague IRR. Needs legal clarity, management credentials, exit strategy.",
    priorities: "IRR methodology, exit strategy, Georgian legal framework, management team, construction timeline, risk mitigation",
    redFlags: "Vague IRR with no basis, no management team, no regulatory mention, no audited financials, no NDA process",
  },
  skier: {
    name: "Expert Skier (Verbier/Val d'Isère regular)",
    desc: "Expert skier, 2-3 alpine seasons/year. Compares everything to Verbier. Non-negotiable: vertical drop. Judges lift capacity, snow record, off-piste terrain.",
    priorities: "Vertical drop, skiable km by level, lift capacity & quality, season length, snow reliability, off-piste & heliski access",
    redFlags: "No vertical drop stated, no season dates, no snowmaking data, lifts listed without capacity, no snow record",
  },
  tourist: {
    name: "Affluent Luxury Traveller",
    desc: "Affluent couple/family, Aman/Six Senses standard. Holistic experience. Access, food, wellness, cultural programme, non-ski activities for companions.",
    priorities: "Airport access & transfer, accommodation quality & price, dining & spa, non-ski activities, Georgian culture, safety & infrastructure",
    redFlags: "No airport/access info, no pricing, thin spa/dining detail, nothing for non-skiers, no cultural element",
  },
};

// Current site content (brief summary — reduces input tokens)
const SITE_SUMMARY = `GORY Mountain Resort — luxury ski resort, Truso Valley, Greater Caucasus, Georgia. Opening Q4 2027.
HERO: "WHERE THE CAUCASUS MEETS THE FUTURE"
VISION: 2,400m altitude, 42km ski slopes, 12 lifts, Grand opening 2027. Poetic copy, no technical specs, no access info.
SKI: Beginner 8km / Intermediate 18km / Expert 16km. No vertical drop. No lift specs. No season dates. No snowmaking.
STAY: 48 Suites (The Peaks Collection), 12 Private Chalets (Glacier), 24 Residences for sale. No pricing. No amenities detail.
EXPERIENCES: Skiing & Snowboarding, Wellness & Spa, Heliskiing, Georgian Gastronomy. No detail on any of these.
INVESTMENT: Foundation Partner $500K (15% IRR), Slope Partner $250K (12% IRR), Summit Member $50K (membership+returns). No timeline, no exit, no team, no legal framework.
GALLERY: 4 images (lounge, gondola, valley, feast). No construction progress. No captions.
CONTACT: Name/Email/Interest/Message form. No phone. No address. No response commitment.`;

function simPrompt(key) {
  const p = PERSONAS[key];
  return `You are a ${p.name} evaluating the GORY Mountain Resort pre-launch website.

${p.desc}
Your priorities: ${p.priorities}
Red flags you watch for: ${p.redFlags}

SITE CONTENT:
${SITE_SUMMARY}

Score each section 1-10 and give authentic first-person reactions. Be genuinely critical.

Return ONLY valid JSON (no markdown):
{"persona":"${p.name}","sections":[{"id":"hero","title":"Hero","perception":"2-3 sentence reaction","strengths":["s1"],"concerns":["c1"],"score":7},{"id":"vision","title":"Vision","perception":"...","strengths":["..."],"concerns":["..."],"score":5},{"id":"ski","title":"Mountain","perception":"...","strengths":["..."],"concerns":["..."],"score":4},{"id":"stay","title":"Stay","perception":"...","strengths":["..."],"concerns":["..."],"score":5},{"id":"experiences","title":"Experiences","perception":"...","strengths":["..."],"concerns":["..."],"score":4},{"id":"investment","title":"Investment","perception":"...","strengths":["..."],"concerns":["..."],"score":5},{"id":"gallery","title":"Gallery","perception":"...","strengths":["..."],"concerns":["..."],"score":5},{"id":"contact","title":"Contact","perception":"...","strengths":["..."],"concerns":["..."],"score":5}],"overall":{"summary":"2-3 sentence verdict","topIssues":["issue1","issue2","issue3"],"recommendation":"single clear action"}}`;
}

function improvePrompt(results) {
  return `Resort website consultant. 3 personas reviewed GORY Mountain Resort site. Generate 5-6 specific improvements with EXACT copy to add.

ALREADY IMPLEMENTED — do not repeat: 800m vertical drop, Dec-Apr season, 12 lifts (1 gondola), 70% snowmaking, 400ha skiable, ski-in/ski-out, butler service, 2,800m² spa, heliskiing 800km, 3 dining venues, Tbilisi 2.5hr road/35min heli, Georgian Investment Law 2006, 7-year timeline, Q4 2027 opening, exit strategy.

PERSONA SCORES & VERDICTS:
Investor: avg=${results[0]?.sections ? (results[0].sections.reduce((s,x)=>s+x.score,0)/results[0].sections.length).toFixed(1) : "?"} — ${results[0]?.overall?.summary?.slice(0,100)}
Skier: avg=${results[1]?.sections ? (results[1].sections.reduce((s,x)=>s+x.score,0)/results[1].sections.length).toFixed(1) : "?"} — ${results[1]?.overall?.summary?.slice(0,100)}
Tourist: avg=${results[2]?.sections ? (results[2].sections.reduce((s,x)=>s+x.score,0)/results[2].sections.length).toFixed(1) : "?"} — ${results[2]?.overall?.summary?.slice(0,100)}

TOP ISSUES by persona:
Investor: ${results[0]?.overall?.topIssues?.join(" | ")}
Skier: ${results[1]?.overall?.topIssues?.join(" | ")}
Tourist: ${results[2]?.overall?.topIssues?.join(" | ")}

Return ONLY valid JSON:
{"summary":"2-sentence exec summary","improvements":[{"sectionId":"investment","sectionTitle":"Investment","priority":1,"concern":"specific issue","personas":["Investor"],"field":"Field","improvement":"Exact copy to add"}]}
Priority 1=critical, 2=important, 3=nice-to-have.`;
}

function applyPrompt(improvements, avgScores) {
  const weakest = Object.entries(avgScores).filter(([,s])=>s<6).sort(([,a],[,b])=>a-b).map(([id,s])=>`${id}:${s}`).join(", ");
  return `Write SHORT content additions (1-2 sentences per slot) for GORY Mountain Resort website. Ultra-luxury tone: minimal, declarative, confident.

IMPROVEMENTS TO ADDRESS: ${improvements?.improvements?.slice(0,5).map(i=>`[${i.sectionId}] ${i.field}: ${i.improvement?.slice(0,80)}`).join(" | ")}
WEAKEST SECTIONS: ${weakest || "none below 6"}

ALREADY ON SITE (skip): 800m vertical, Dec-Apr, 12 lifts, 70% snowmaking, ski-in/ski-out, butler, pricing €850+/night, 2,800m² spa, heliskiing 800km, 3 dining venues, summer June-Sep, Tbilisi 2.5hr/35min heli, Georgian law 2006, Q4 2027, exit strategy.

Return ONLY valid JSON:
{"ski_ai":{"en":"...","ru":"..."},"stay_ai":{"en":"...","ru":"..."},"investment_ai":{"en":"...","ru":"..."},"contact_ai":{"en":"...","ru":"..."},"experiences_ai":{"en":"...","ru":"..."},"vision_ai":{"en":"...","ru":"..."}}
Use "" where nothing genuine to add.`;
}

function avg(sections) { return sections?.length ? +(sections.reduce((s,x)=>s+x.score,0)/sections.length).toFixed(2) : 0; }

// ── Main ──────────────────────────────────────────────────────────────────
const TOTAL = 10;
const allResults = [];

writeFileSync(LOG, `🏔  GORY Simulator — ${TOTAL} iterations × 3 personas\nModel: ${MODEL} | Gap: ${CALL_GAP_MS/1000}s | Started: ${new Date().toISOString()}\n\n`);

for (let i = 1; i <= TOTAL; i++) {
  L(`\n━━━ Iteration ${i}/${TOTAL} — ${new Date().toISOString()} ━━━`);
  const iter = { n: i };

  for (const key of ["investor", "skier", "tourist"]) {
    L(`  [${key}] simulating…`);
    try {
      iter[key] = await gemini(simPrompt(key), 1800);
      L(`  [${key}] avg=${avg(iter[key].sections)} | ${iter[key].overall?.summary?.slice(0,90)}`);
    } catch(e) {
      L(`  [${key}] FAILED: ${e.message?.slice(0,100)}`);
      iter[key] = { persona: PERSONAS[key].name, sections: [], overall: { summary: "failed", topIssues: [], recommendation: "" } };
    }
  }

  L(`  [improve]…`);
  try {
    iter.improvements = await gemini(improvePrompt([iter.investor, iter.skier, iter.tourist]), 1500);
    L(`  [improve] ${iter.improvements.improvements?.length ?? 0} improvements`);
  } catch(e) {
    L(`  [improve] FAILED: ${e.message?.slice(0,100)}`);
    iter.improvements = { summary: "failed", improvements: [] };
  }

  const scores = {};
  for (const key of ["investor","skier","tourist"]) {
    for (const s of (iter[key].sections || [])) {
      if (!scores[s.id]) scores[s.id] = [];
      scores[s.id].push(s.score);
    }
  }
  iter.avgScores = Object.fromEntries(Object.entries(scores).map(([id,arr])=>[id, +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1)]));

  L(`  [apply]…`);
  try {
    iter.patches = await gemini(applyPrompt(iter.improvements, iter.avgScores), 1500);
    const keys = Object.keys(iter.patches).filter(k=>iter.patches[k]?.en?.trim());
    L(`  [apply] patched: ${keys.join(", ")}`);
  } catch(e) {
    L(`  [apply] FAILED: ${e.message?.slice(0,100)}`);
    iter.patches = {};
  }

  iter.invAvg = avg(iter.investor.sections);
  iter.skiAvg = avg(iter.skier.sections);
  iter.touAvg = avg(iter.tourist.sections);
  iter.overall = +((iter.invAvg + iter.skiAvg + iter.touAvg)/3).toFixed(2);
  L(`  ✓ inv=${iter.invAvg} ski=${iter.skiAvg} tou=${iter.touAvg} overall=${iter.overall}`);
  allResults.push(iter);
}

writeFileSync(join(__dir, "sim_results_10.json"), JSON.stringify(allResults, null, 2));
L(`\n✓ Done. Results → sim_results_10.json`);

// Write ai-content.ts from last successful patches
const last = allResults.slice().reverse().find(r => r.patches && Object.keys(r.patches).some(k=>r.patches[k]?.en?.trim()));
if (last) {
  const filtered = Object.fromEntries(Object.entries(last.patches).filter(([,v])=>v?.en?.trim()));
  const patchedSections = Object.keys(filtered).map(k=>k.replace("_ai",""));
  const ts = new Date().toISOString();
  const entries = Object.entries(filtered).map(([k,v])=>`  ${k}: { en: ${JSON.stringify(v.en)}, ru: ${JSON.stringify(v.ru)} }`).join(",\n");
  const aiContentPath = join(__dir, "artifacts/gory-resort/src/contexts/ai-content.ts");
  mkdirSync(dirname(aiContentPath), { recursive: true });
  writeFileSync(aiContentPath, `// AUTO-GENERATED BY AI SIMULATOR — DO NOT EDIT MANUALLY
// Last updated: ${ts}
// Sections patched: ${patchedSections.join(", ")}
export const aiContent: Record<string, { en: string; ru: string }> = {
${entries}
};
export const aiRunMeta = {
  timestamp: "${ts}",
  runCount: ${TOTAL},
  avgScores: ${JSON.stringify(last.avgScores)},
  patchedSections: ${JSON.stringify(patchedSections)},
};
`);
  L(`✓ ai-content.ts → ${patchedSections.join(", ")}`);
}
