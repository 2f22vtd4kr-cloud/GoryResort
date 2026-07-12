import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
// dist/ → ../../gory-resort/src/ai-content.ts
const AI_CONTENT_FILE = join(__dir, "../../gory-resort/src/contexts/ai-content.ts");

const applyRouter = Router();

interface ImprovementItem {
  sectionId: string;
  field: string;
  improvement: string;
  priority: number;
  concern?: string;
  personas?: string[];
}

interface ImprovementResult {
  summary: string;
  improvements: ImprovementItem[];
}

applyRouter.post("/apply", async (req, res) => {
  const { improvements, scores } = req.body as {
    improvements: ImprovementResult;
    scores: Record<string, Array<{ id: string; score: number }>>;
  };

  if (!improvements?.improvements?.length) {
    return res.status(400).json({ error: "'improvements' is required" });
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  // Compute average section scores across all personas
  const sectionScoreMap: Record<string, number[]> = {};
  if (scores) {
    for (const personaScores of Object.values(scores)) {
      for (const { id, score } of personaScores) {
        if (!sectionScoreMap[id]) sectionScoreMap[id] = [];
        sectionScoreMap[id].push(score);
      }
    }
  }
  const avgScores = Object.fromEntries(
    Object.entries(sectionScoreMap).map(([id, sArr]) => [
      id,
      Math.round((sArr.reduce((a, b) => a + b, 0) / sArr.length) * 10) / 10,
    ])
  );

  const weakest = Object.entries(avgScores)
    .filter(([, s]) => s < 6)
    .sort(([, a], [, b]) => a - b)
    .map(([id, s]) => `${id}:${s}`)
    .join(", ");

  const prompt = `You are writing supplementary content additions for a luxury ski resort website (GORY Mountain Resort — Truso Valley, Greater Caucasus, Georgia, opening 2027).

AI personas have reviewed the site and flagged gaps. Write SHORT, impactful additions (2–3 sentences per section) based on this feedback.

IMPROVEMENT SUGGESTIONS:
${JSON.stringify(improvements.improvements.slice(0, 8), null, 2)}

SECTION SCORES (avg across 3 personas — lower = weaker):
${JSON.stringify(avgScores)}
Weakest: ${weakest || "none below 6"}

ALREADY ON THE SITE — do not repeat:
- Ski: 800m vertical, Dec–Apr, 12 lifts (1 gondola), 70% snowmaking, 380cm avg snowfall, 18,000 skiers/hr
- Stay: ski-in/ski-out, butler, private pools, rental yield programme, pricing (€850+/night, €4,500+/night, $2.1M residences)
- Experiences: 42km pistes, 400ha off-piste, 2,800m² spa, heliskiing 800km, 3 dining venues, summer June–Sep
- Investment: 2024–2027 build, Q4 2027 opening, 7-year hold, exit strategy, Georgian law, CAV team, IRR vs Gudauri/Mestia/Val d'Isère
- Vision: Tbilisi → 2.5hr road / 35min helicopter
- Contact: Kazbegi Municipality address

SLOTS — write content only where there is a real addressable gap:
- "ski_ai": summit elevation, terrain type breakdown, off-piste patrol, competitor comparison
- "stay_ai": concierge booking process, what's included in each tier, residence management
- "investment_ai": investor NDA/confidentiality process, next steps, who to contact, minimum commitment process
- "contact_ai": direct phone number, response time commitment, investor-specific contact route
- "experiences_ai": cultural/Georgian programme, children's activities, non-ski for families, fitness/training
- "vision_ai": Georgia macro context, why Caucasus now, nearby UNESCO sites or attractions

TONE: Ultra-luxury, confident, minimal. Short, declarative sentences. No marketing hype. Natural Russian.

Return ONLY valid JSON, no markdown fences:
{
  "ski_ai": { "en": "...", "ru": "..." },
  "stay_ai": { "en": "...", "ru": "..." },
  "investment_ai": { "en": "...", "ru": "..." },
  "contact_ai": { "en": "...", "ru": "..." },
  "experiences_ai": { "en": "...", "ru": "..." },
  "vision_ai": { "en": "...", "ru": "..." }
}
Use "" for any section where there is genuinely nothing to add.`;

  async function geminiWithRetry(fn: () => Promise<string | null | undefined>): Promise<string | null | undefined> {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const delayMatch = msg.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
        const isQuota = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        if (isQuota && attempt < 3) {
          const delaySec = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) : 30 * (attempt + 1);
          console.warn(`[apply] 429 on attempt ${attempt + 1}, waiting ${delaySec}s…`);
          await new Promise((r) => setTimeout(r, delaySec * 1000));
          continue;
        }
        throw err;
      }
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const text = await geminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });
      return response.text;
    });
    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    let patches: Record<string, { en: string; ru: string }>;
    try {
      patches = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { patches = JSON.parse(match[0]); }
        catch { return res.status(500).json({ error: "Failed to parse patches JSON" }); }
      } else {
        return res.status(500).json({ error: "No JSON in Gemini response" });
      }
    }

    // Keep only non-empty patches
    const filtered = Object.fromEntries(
      Object.entries(patches).filter(([, v]) => v?.en?.trim())
    ) as Record<string, { en: string; ru: string }>;

    const patchedSections = Object.keys(filtered).map((k) => k.replace("_ai", ""));
    const timestamp = new Date().toISOString();

    // Serialise entries as a TypeScript object literal
    const filteredEntries = Object.entries(filtered)
      .map(([k, v]) => `  ${k}: { en: ${JSON.stringify(v.en)}, ru: ${JSON.stringify(v.ru)} }`)
      .join(",\n");

    const fileContent = `// AUTO-GENERATED BY AI SIMULATOR — DO NOT EDIT MANUALLY
// Last updated: ${timestamp}
// Sections patched: ${patchedSections.join(", ") || "none"}
export const aiContent: Record<string, { en: string; ru: string }> = {
${filteredEntries}
};
export const aiRunMeta = {
  timestamp: "${timestamp}",
  runCount: 1,
  avgScores: ${JSON.stringify(avgScores)},
  patchedSections: ${JSON.stringify(patchedSections)},
};
`;

    await writeFile(AI_CONTENT_FILE, fileContent, "utf-8");
    console.log(`[apply] Wrote ${patchedSections.length} AI patches → ai-content.ts`);

    return res.json({ patchedSections, patchCount: patchedSections.length, timestamp, patches: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini apply error:", message);
    return res.status(500).json({ error: message });
  }
});

export default applyRouter;
