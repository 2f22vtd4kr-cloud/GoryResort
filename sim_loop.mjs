#!/usr/bin/env node
// 1000-iteration simulator loop — all 3 personas per run → improve → apply
// Runs sequentially with pacing to respect Gemini free-tier rate limits.

const API = "http://localhost:8080";
const TOTAL = 1000;

// Minimum gap between any two Gemini calls (ms).
// Free tier: 15 RPM → 4s/req minimum. We use 5s to be safe.
const MIN_CALL_GAP_MS = 5000;

let lastCallAt = 0;
async function paced() {
  const wait = MIN_CALL_GAP_MS - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
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
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function avg(sections) {
  return (sections.reduce((s, x) => s + x.score, 0) / sections.length).toFixed(2);
}

async function runIteration(n) {
  const t0 = Date.now();

  // Simulate personas SEQUENTIALLY — parallel calls saturate the per-minute token quota
  await paced(); const investor = await post("/api/simulate", { persona: "investor" });
  await paced(); const skier    = await post("/api/simulate", { persona: "skier" });
  await paced(); const tourist  = await post("/api/simulate", { persona: "tourist" });

  // Improve
  await paced(); const improvements = await post("/api/improve", { results: [investor, skier, tourist] });

  // Apply
  const scores = {
    investor: investor.sections.map((s) => ({ id: s.id, score: s.score })),
    skier:    skier.sections.map((s)    => ({ id: s.id, score: s.score })),
    tourist:  tourist.sections.map((s)  => ({ id: s.id, score: s.score })),
  };
  await paced(); const applied = await post("/api/apply", { improvements, scores });

  const elapsed = Date.now() - t0;
  const allSections = [...investor.sections, ...skier.sections, ...tourist.sections];
  const overall = avg(allSections);
  const invAvg  = avg(investor.sections);
  const skiAvg  = avg(skier.sections);
  const touAvg  = avg(tourist.sections);

  console.log(
    `[${new Date().toISOString()}] iter ${String(n).padStart(4)}/${TOTAL}` +
    `  avg=${overall}  inv=${invAvg}  ski=${skiAvg}  tou=${touAvg}` +
    `  patches=${applied.patchCount ?? "?"}  [${(elapsed / 1000).toFixed(0)}s]`
  );
}

// Parse retryDelay from Gemini 429 error bodies: "59s", "4.6s", "43ms", etc.
function parseRetryDelay(msg) {
  const secMatch  = msg.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
  const msMatch   = msg.match(/"retryDelay"\s*:\s*"([\d.]+)ms"/);
  if (secMatch)  return Math.ceil(parseFloat(secMatch[1])) * 1000;
  if (msMatch)   return Math.ceil(parseFloat(msMatch[1]));
  return 60_000; // safe default: 1 minute
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting ${TOTAL}-iteration sim loop (sequential, 5s pacing)`);

  // Wait for API to be ready
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const r = await fetch(`${API}/`, { signal: AbortSignal.timeout(3000) });
      if (r.status < 500) break;
    } catch {
      console.log(`Waiting for API… (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  let errors = 0;
  for (let i = 1; i <= TOTAL; i++) {
    let done = false;
    let attempt = 0;
    while (!done) {
      try {
        await runIteration(i);
        done = true;
      } catch (err) {
        attempt++;
        errors++;
        const msg = err instanceof Error ? err.message : String(err);
        const is429 = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        let waitMs = is429 ? parseRetryDelay(msg) : 5_000;
        // Cap max wait at 2 minutes; never retry more than 5 times per iteration
        waitMs = Math.min(waitMs, 120_000);
        if (attempt >= 5) {
          console.error(`[${new Date().toISOString()}] iter ${i} gave up after ${attempt} attempts. Moving on.`);
          done = true;
        } else {
          console.warn(`[${new Date().toISOString()}] iter ${i} attempt ${attempt} failed (${is429 ? "429" : "err"}), waiting ${(waitMs / 1000).toFixed(0)}s — ${msg.slice(0, 120)}`);
          await new Promise((r) => setTimeout(r, waitMs));
          lastCallAt = 0; // reset pacing after a wait
        }
      }
    }
  }

  console.log(`[${new Date().toISOString()}] Loop complete. ${TOTAL} iterations, ${errors} total errors.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
