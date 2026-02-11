import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type Plan = {
  phase: string;
  todaysFocus: string;
  workout: {
    title: string;
    durationMinutes: number;
    warmup: string[];
    mainSet: string[];
    cooldown: string[];
    intensity: "easy" | "moderate" | "hard";
    modifications: string[];
  };
  nutrition: {
    theme: string;
    meals: string[];
    hydration: string[];
  };
  recovery: {
    practices: string[];
    sleepTip: string;
  };
  mindset: {
    fiveMinutePractice: string[];
    mantra: string;
  };
  safetyNotes: string[];
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      cycleDay,
      energy,
      minutesAvailable,
      equipment,
      soreness,
      goal,
      dietaryPrefs,
      notes,
    } = body;

    const phase =
      cycleDay <= 5
        ? "Menstrual"
        : cycleDay <= 13
        ? "Follicular"
        : cycleDay <= 16
        ? "Ovulatory"
        : "Luteal";

    const prompt = `
You are a cycle-aware fitness and wellness coach.

User context:
- Cycle day: ${cycleDay}
- Phase: ${phase}
- Energy level: ${energy}
- Time available: ${minutesAvailable} minutes
- Equipment: ${equipment}
- Soreness or pain: ${soreness}
- Goal: ${goal}
- Diet: ${dietaryPrefs}
- Notes: ${notes}

Create a realistic plan for TODAY with:
1) A short workout (warmup, main, cooldown)
2) Nutrition suggestions
3) Recovery tips
4) A 5-minute mindset practice
5) Safety notes
`;

    // ✅ Force the model to return *only JSON* that matches our schema
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Return ONLY JSON. No markdown. No extra text." },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cycle_plan",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "phase",
              "todaysFocus",
              "workout",
              "nutrition",
              "recovery",
              "mindset",
              "safetyNotes",
            ],
            properties: {
              phase: { type: "string" },
              todaysFocus: { type: "string" },
              workout: {
                type: "object",
                additionalProperties: false,
                required: [
                  "title",
                  "durationMinutes",
                  "warmup",
                  "mainSet",
                  "cooldown",
                  "intensity",
                  "modifications",
                ],
                properties: {
                  title: { type: "string" },
                  durationMinutes: { type: "number" },
                  warmup: { type: "array", items: { type: "string" } },
                  mainSet: { type: "array", items: { type: "string" } },
                  cooldown: { type: "array", items: { type: "string" } },
                  intensity: { type: "string", enum: ["easy", "moderate", "hard"] },
                  modifications: { type: "array", items: { type: "string" } },
                },
              },
              nutrition: {
                type: "object",
                additionalProperties: false,
                required: ["theme", "meals", "hydration"],
                properties: {
                  theme: { type: "string" },
                  meals: { type: "array", items: { type: "string" } },
                  hydration: { type: "array", items: { type: "string" } },
                },
              },
              recovery: {
                type: "object",
                additionalProperties: false,
                required: ["practices", "sleepTip"],
                properties: {
                  practices: { type: "array", items: { type: "string" } },
                  sleepTip: { type: "string" },
                },
              },
              mindset: {
                type: "object",
                additionalProperties: false,
                required: ["fiveMinutePractice", "mantra"],
                properties: {
                  fiveMinutePractice: { type: "array", items: { type: "string" } },
                  mantra: { type: "string" },
                },
              },
              safetyNotes: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.output_text) as Plan;
    return Response.json(data);
  } catch (error: any) {
    console.error("API /plan error:", error);
    return Response.json(
      { error: "Failed to generate plan", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
