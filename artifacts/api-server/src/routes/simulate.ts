import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const simulateRouter = Router();

const SITE_CONTENT = {
  hero: {
    title: "GORY Mountain Resort",
    tagline: "WHERE THE CAUCASUS MEETS THE FUTURE",
    badge: "OPENING 2027",
    context: "Full-screen hero with dramatic mountain backdrop, animated GORY lettering, and animated scroll chevron",
  },
  vision: {
    title: "THE VISION",
    stats: ["2,400m altitude", "42km ski slopes", "12 lifts planned", "Grand opening 2027"],
    description1:
      "A new chapter in Caucasian mountain culture. GORY is not merely a resort — it is a new destination forged from ancient stone and visionary ambition.",
    description2:
      "Set against the backdrop of the world's most dramatic mountain range, GORY will redefine alpine luxury for the next generation.",
    missingInfo: "No mention of vertical drop, snow conditions, or access route",
  },
  ski: {
    title: "THE MOUNTAIN",
    trails: [
      { level: "BEGINNER", distance: "8km" },
      { level: "INTERMEDIATE", distance: "18km" },
      { level: "EXPERT", distance: "16km" },
    ],
    missingInfo:
      "No mention of vertical drop (crucial for skiers), lift capacity, season length, snowmaking, or off-piste terrain",
  },
  stay: {
    title: "SANCTUARY",
    accommodations: [
      { type: "The Peaks Collection", desc: "48 Suites" },
      { type: "Glacier Chalets", desc: "12 Private Chalets" },
      { type: "Base Camp Residences", desc: "24 Residences for sale" },
    ],
    missingInfo: "No pricing, no specific amenities per property type, no ski-in/ski-out info",
  },
  experiences: {
    title: "ELEVATED EXPERIENCES",
    pillars: ["Skiing & Snowboarding", "Wellness & Spa", "Heliskiing", "Georgian Gastronomy"],
    missingInfo: "Very brief — no details on spa size, dining options, heliski areas, or non-ski activities",
  },
  investment: {
    title: "INVEST IN THE CAUCASUS",
    subhead:
      "Limited early-stage investment positions available. Join the founding partners shaping the future of mountain luxury in Georgia.",
    tiers: [
      { tier: "FOUNDATION PARTNER", from: "$500,000", return: "15% projected IRR" },
      { tier: "SLOPE PARTNER", from: "$250,000", return: "12% projected IRR" },
      { tier: "SUMMIT MEMBER", from: "$50,000", return: "Resort membership + returns" },
    ],
    missingInfo:
      "No investment timeline, no exit strategy, no development company info, no regulatory/legal framework mentioned, no audited financials, IRR is 'projected' with no basis stated",
  },
  gallery: {
    title: "GALLERY",
    images: ["Resort lounge interior", "Mountain gondola / cable car", "Valley aerial view", "Georgian feast / gastronomy table"],
    missingInfo: "No captions, no construction progress photos, no team photos",
  },
  contact: {
    title: "CONNECT",
    fields: ["Name", "Email", "Interest (Investor / Guest / Media)", "Message"],
    cta: "SUBMIT INQUIRY",
    missingInfo: "No phone number, no physical address for visits, no response time commitment, no NDA/confidentiality process for investors",
  },
};

const PERSONAS = {
  investor: {
    name: "Experienced Resort Investor",
    description:
      "A high-net-worth individual or family office evaluating pre-opening luxury resort investments. Has seen dozens of pitches. Skeptical of unsubstantiated IRR claims. Needs to see credibility signals, legal clarity, and an exit strategy before committing.",
    priorities: ["IRR credibility and methodology", "Exit strategy", "Regulatory/legal environment in Georgia", "Management team track record", "Construction progress evidence", "Risk mitigation"],
    redFlags: [
      "Vague IRR projections with no basis",
      "No management team info",
      "No regulatory mention",
      "No construction timeline",
      "No audited financials",
      "No NDA/legal process for interested investors",
    ],
  },
  skier: {
    name: "Avid Skier (Verbier / Val d'Isère regular)",
    description:
      "A passionate skier who holidays 2–3 times per year at top Alpine resorts. Values total vertical drop, terrain variety, reliable snow cover, modern lift systems, and off-piste access. Will compare to established benchmarks.",
    priorities: [
      "Vertical drop (essential metric)",
      "Total skiable km by difficulty",
      "Lift system quality and capacity",
      "Season length and snow reliability",
      "Off-piste and heliski terrain",
      "Après-ski culture",
    ],
    redFlags: [
      "No vertical drop stated (42km with no vertical is meaningless)",
      "No season dates",
      "No snowmaking capacity",
      "Lift count without specs",
      "No summit elevation comparison",
    ],
  },
  tourist: {
    name: "Affluent Luxury Traveller",
    description:
      "An affluent couple or family considering Georgia for a luxury mountain holiday. Has stayed at Aman, Six Senses, Badrutt's Palace. Cares about holistic experience — food, wellness, atmosphere, service, and ease of getting there.",
    priorities: [
      "How to get there (nearest airport, transfer time)",
      "Accommodation quality and price range",
      "Dining and wellness quality",
      "Non-ski activities for mixed groups",
      "Overall atmosphere and vibe",
      "Safety and infrastructure",
    ],
    redFlags: [
      "No airport/access info",
      "No pricing signals",
      "Thin dining/spa detail",
      "No activities for non-skiers",
      "No sustainability story",
      "No sense of Georgian culture integration",
    ],
  },
};

simulateRouter.post("/simulate", async (req, res) => {
  const { persona: personaKey } = req.body as { persona: string };

  if (!personaKey || !PERSONAS[personaKey as keyof typeof PERSONAS]) {
    return res.status(400).json({ error: "Invalid persona. Use: investor, skier, or tourist" });
  }

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const persona = PERSONAS[personaKey as keyof typeof PERSONAS];

  const prompt = `You are role-playing as a specific website visitor evaluating the pre-launch marketing site for GORY Mountain Resort — a luxury ski resort under construction in the Georgian Greater Caucasus (Truso Valley, near Kazbegi), opening in 2027.

YOUR PERSONA:
Name: ${persona.name}
Description: ${persona.description}
Top priorities: ${persona.priorities.join(", ")}
Red flags you watch for: ${persona.redFlags.join(", ")}

COMPLETE SITE CONTENT (what you see on the website):
${JSON.stringify(SITE_CONTENT, null, 2)}

RUSSIAN TRANSLATIONS TO AUDIT:
- hero_tagline RU: "ГДЕ КАВКАЗ ВСТРЕЧАЕТ БУДУЩЕЕ" (EN: WHERE THE CAUCASUS MEETS THE FUTURE)
- vision_stat_1_lbl RU: "м высота" (EN: m altitude) — should it be "м над уровнем моря"?
- vision_stat_2_lbl RU: "км горнолыжных трасс" (EN: km ski slopes) — natural?
- vision_stat_3_lbl RU: "запланированных подъёмников" (EN: lifts planned) — natural?
- stay_desc_3 RU: "24 Резиденции" vs EN: "24 Residences for sale" — missing "for sale"
- exp_1 RU: "Катание на лыжах" vs EN: "Skiing & Snowboarding" — missing snowboarding
- inv_tier_1_title RU: "ФУНДАМЕНТАЛЬНЫЙ ПАРТНЕР" vs EN: "FOUNDATION PARTNER" — "Фундаментальный" means "fundamental/basic" not "founding"; better: "ПАРТНЁР-ОСНОВАТЕЛЬ"?
- inv_tier_2_title RU: "ПАРТНЕР СКЛОНОВ" (EN: SLOPE PARTNER) — natural?
- footer copyright: currently shows 2024, site opens 2027

YOUR TASK:
1. Analyse each of the 8 sections from your persona's authentic perspective.
2. Identify what you find compelling, what leaves you cold, and what critical questions go unanswered.
3. Score each section 1–10 for how well it serves YOUR specific needs.
4. Note any Russian translation issues with suggested corrections.
5. Provide an overall verdict.

Be genuinely critical and honest. Luxury investors and expert skiers have high standards. Generic praise is not helpful.

Respond ONLY with valid JSON — no markdown, no code fences — in this exact format:
{
  "persona": "${persona.name}",
  "sections": [
    {
      "id": "hero",
      "title": "Hero",
      "perception": "First-person reaction in 2-3 sentences, capturing authentic emotional response",
      "strengths": ["specific strength 1", "specific strength 2"],
      "concerns": ["specific concern 1", "specific concern 2"],
      "score": 7
    },
    {
      "id": "vision",
      "title": "The Vision",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 5
    },
    {
      "id": "ski",
      "title": "The Mountain",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 4
    },
    {
      "id": "stay",
      "title": "Sanctuary",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 5
    },
    {
      "id": "experiences",
      "title": "Elevated Experiences",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 4
    },
    {
      "id": "investment",
      "title": "Invest in the Caucasus",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 5
    },
    {
      "id": "gallery",
      "title": "Gallery",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 5
    },
    {
      "id": "contact",
      "title": "Connect",
      "perception": "...",
      "strengths": ["..."],
      "concerns": ["..."],
      "score": 5
    }
  ],
  "overall": {
    "summary": "2-3 sentence verdict on the site as a whole from this persona's perspective",
    "topIssues": [
      "Most critical missing piece for this persona",
      "Second most critical issue",
      "Third most critical issue"
    ],
    "recommendation": "Single clear action the site team should take first to serve this persona better"
  },
  "translationIssues": [
    {
      "key": "translation_key_name",
      "issue": "What is wrong with the current Russian text",
      "suggested": "Suggested correction in Russian"
    }
  ]
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
          return res.status(500).json({ error: "Failed to parse Gemini JSON response", preview: text.slice(0, 300) });
        }
      } else {
        return res.status(500).json({ error: "No JSON found in Gemini response", preview: text.slice(0, 300) });
      }
    }

    return res.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini API error:", message);
    return res.status(500).json({ error: message });
  }
});

export default simulateRouter;
