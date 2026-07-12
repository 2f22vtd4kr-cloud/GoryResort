#!/usr/bin/env node
// 10-iteration simulation runner — captures full results for reporting
import { writeFileSync } from "fs";

const API = "http://localhost:8080";
const TOTAL = 10;
const MIN_CALL_GAP_MS = 5000;

let lastCallAt = 0;
async function paced() {
  const wait = MIN_CALL_GAP_MS - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

function parseRetryDelay(msg) {
  const secMatch = msg.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
  const msMatch  = msg.match(/"retryDelay"\s*:\s*"([\d.]+)ms"/);
  if (secMatch) return Math.ceil(parseFloat(secMatch[1])) * 1000;
  if (msMatch)  return Math.ceil(parseFloat(msMatch[1]));
  return 60_000;
}

async function post(path, body, timeoutMs = 180_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const is429 = res.status === 429 || text.includes("429") || text.includes("RESOURCE_EXHAUSTED");
      if (is429) {
        const err = new Error(`HTTP 429: ${text.slice(0, 300)}`);
        err.is429 = true;
        err.raw = text;
        throw err;
      }
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

async function postWithRetry(path, body, label) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      return await post(path, body);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = err.is429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
      if (is429 && attempt < 8) {
        const waitMs = Math.min(parseRetryDelay(err.raw || msg), 120_000);
        console.warn(`  [${label}] 429, waiting ${(waitMs/1000).toFixed(0)}s (attempt ${attempt})…`);
        await new Promise((r) => setTimeout(r, waitMs));
        lastCallAt = 0;
        continue;
      }
      throw err;
    }
  }
}

function avg(sections) {
  return +(sections.reduce((s, x) => s + x.score, 0) / sections.length).toFixed(2);
}

const allIterations = [];

async function runIteration(n) {
  console.log(`\n=== Iteration ${n}/${TOTAL} ===`);

  await paced(); 
  console.log("  Simulating: investor…");
  const investor = await postWithRetry("/api/simulate", { persona: "investor" }, "investor");

  await paced();
  console.log("  Simulating: skier…");
  const skier = await postWithRetry("/api/simulate", { persona: "skier" }, "skier");

  await paced();
  console.log("  Simulating: tourist…");
  const tourist = await postWithRetry("/api/simulate", { persona: "tourist" }, "tourist");

  await paced();
  console.log("  Improving…");
  const improvements = await postWithRetry("/api/improve", { results: [investor, skier, tourist] }, "improve");

  const scores = {
    investor: investor.sections.map((s) => ({ id: s.id, score: s.score })),
    skier:    skier.sections.map((s)    => ({ id: s.id, score: s.score })),
    tourist:  tourist.sections.map((s)  => ({ id: s.id, score: s.score })),
  };

  await paced();
  console.log("  Applying…");
  const applied = await postWithRetry("/api/apply", { improvements, scores }, "apply");

  const invAvg = avg(investor.sections);
  const skiAvg = avg(skier.sections);
  const touAvg = avg(tourist.sections);
  const overall = +((invAvg + skiAvg + touAvg) / 3).toFixed(2);

  console.log(`  scores: inv=${invAvg} ski=${skiAvg} tou=${touAvg} overall=${overall} patches=${applied.patchCount ?? "?"}`);

  allIterations.push({ n, investor, skier, tourist, improvements, applied, invAvg, skiAvg, touAvg, overall });
}

// Wait for API
for (let i = 0; i < 20; i++) {
  try {
    const r = await fetch(`${API}/`, { signal: AbortSignal.timeout(3000) });
    if (r.status < 500) break;
  } catch {
    console.log(`Waiting for API… (${i + 1})`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}

console.log(`Starting ${TOTAL} iterations — 3 personas + improve + apply each`);

for (let i = 1; i <= TOTAL; i++) {
  let done = false, attempt = 0;
  while (!done) {
    try {
      await runIteration(i);
      done = true;
    } catch (err) {
      attempt++;
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt >= 3) {
        console.error(`  iter ${i} gave up after ${attempt} errors: ${msg.slice(0, 120)}`);
        done = true;
      } else {
        console.warn(`  iter ${i} error, retrying in 10s: ${msg.slice(0, 120)}`);
        await new Promise((r) => setTimeout(r, 10_000));
      }
    }
  }
}

// Save full results for reporting
writeFileSync("sim_results_10.json", JSON.stringify(allIterations, null, 2), "utf-8");
console.log(`\nDone. Results saved to sim_results_10.json`);
