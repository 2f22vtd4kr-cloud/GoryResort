import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const improveRouter = Router();

improveRouter.post("/api/improve", async (req, res) => {
  const { results } = req.body as { results: unknown[] };

  if (!Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ error: "'results' must be a non-empty array of simulation results" });
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
  }

  const prompt = `You are an expert luxury resort website consultant. Three distinct user personas have just reviewed the GORY Mountain Resort website (a pre-opening luxury mountain resort in Georgia/Caucasus, opening 2027) and provided detailed section-by-section analysis. Based on their combined feedback, generate specific, implementable content improvements for the website.

PERSONA SIMULATION RESULTS:
${JSON.stringify(results, null, 2)}

KNOWN SITE CONTENT ALREADY IMPLEMENTED (do not suggest these again):
- Ski/Mountain: 800m vertical drop, Dec–Apr season, 12 lifts (1 gondola), 70% snowmaking, 400+ ha skiable
- Stay: Ski-in/ski-out, butler service, private pools (chalets), rental yield programme (residences)
- Experiences: Descriptions added for spa (2,800m²), heliski (800km backcountry), dining (3 venues + 40,000-bottle cellar)
- Investment: Timeline stated (2024–2027 build, Q4 2027 opening, 7-year horizon), exit strategy (portfolio sale or listed vehicle), legal framework (Georgian Law on Investment Activity 2006)
- Vision: Access route added (Tbilisi airport: 2.5hr by road / 35min helicopter)

REMAINING GAPS still to address:
- No pricing ranges for suites, chalets, residences
- No management team or development company credentials
- No audited financials or basis for IRR projections
- No snowfall averages or historic snow record
- No phone number or physical address in Contact section
- No response time commitment or NDA process for investors
- No construction progress photography in Gallery
- No non-ski or summer activities mentioned
- No lift capacity (skiers/hour) data
- No comparison to peer resorts (Gudauri, Mestia nearby)

Generate 6–10 specific, implementable improvements. For each, write the EXACT text/content that should be added — not vague suggestions but the actual copy or data to appear on the site.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "summary": "2-3 sentence executive summary of the most impactful remaining improvements across all personas",
  "improvements": [
    {
      "sectionId": "investment",
      "sectionTitle": "Investment",
      "priority": 1,
      "concern": "All three personas note missing management team — the single biggest credibility gap for a pre-opening resort asking for $50k–$500k",
      "personas": ["Investor", "Skier", "Traveller"],
      "field": "Development Team",
      "improvement": "Add a 'Development Team' strip: 'GORY Mountain Resort is developed by Caucasus Alpine Ventures, co-founded by [CEO Name] (former President, Gudauri Ski Resort) and [CFO Name] (Partner, Georgian Infrastructure Fund). Construction is managed by Alpine Builders GmbH, the team behind Kitzsteinhorn's last expansion phase.'"
    }
  ]
}

Priority: 1 = critical (deal-breaker for 2+ personas), 2 = important, 3 = nice-to-have. Order by priority descending.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          return res.status(500).json({ error: "Failed to parse Gemini JSON response" });
        }
      } else {
        return res.status(500).json({ error: "No JSON found in Gemini response" });
      }
    }

    return res.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini improve error:", message);
    return res.status(500).json({ error: message });
  }
});

export default improveRouter;
