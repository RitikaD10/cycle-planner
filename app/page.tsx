"use client";

import { useMemo, useState } from "react";

type Plan = {
  phase: string;
  todaysFocus: string;
  workout: {
    title: string;
    durationMinutes: number;
    warmup: string[];
    mainSet: string[];
    cooldown: string[];
    intensity: "easy" | "moderate" | "hard" | string;
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

export default function Home() {
  const [cycleDay, setCycleDay] = useState(18);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [minutesAvailable, setMinutesAvailable] = useState(45);
  const [equipment, setEquipment] = useState("yoga mat, dumbbells");
  const [soreness, setSoreness] = useState("none");
  const [goal, setGoal] = useState("balanced fitness + mood");
  const [dietaryPrefs, setDietaryPrefs] = useState("vegetarian");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phaseHint = useMemo(() => {
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 16) return "Ovulatory";
    return "Luteal";
  }, [cycleDay]);

  async function generate() {
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleDay: Number(cycleDay),
          energy,
          minutesAvailable: Number(minutesAvailable),
          equipment,
          soreness,
          goal,
          dietaryPrefs,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setPlan(data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyPlan() {
    if (!plan) return;

    const text =
      `Phase: ${plan.phase}\nFocus: ${plan.todaysFocus}\n\n` +
      `Workout: ${plan.workout.title} (${plan.workout.durationMinutes} min, ${plan.workout.intensity})\n` +
      `Warmup:\n- ${plan.workout.warmup.join("\n- ")}\n` +
      `Main:\n- ${plan.workout.mainSet.join("\n- ")}\n` +
      `Cooldown:\n- ${plan.workout.cooldown.join("\n- ")}\n\n` +
      `Nutrition (${plan.nutrition.theme}):\n- ${plan.nutrition.meals.join("\n- ")}\n` +
      `Hydration:\n- ${plan.nutrition.hydration.join("\n- ")}\n\n` +
      `Recovery:\n- ${plan.recovery.practices.join("\n- ")}\n` +
      `Sleep: ${plan.recovery.sleepTip}\n\n` +
      `5-min practice:\n- ${plan.mindset.fiveMinutePractice.join("\n- ")}\n` +
      `Mantra: ${plan.mindset.mantra}\n\n` +
      `Safety:\n- ${plan.safetyNotes.join("\n- ")}`;

    navigator.clipboard.writeText(text);
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Cycle-Synced Planner (MVP)</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Enter today’s context → get a plan. (Phase hint: <b>{phaseHint}</b>)
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
        }}
      >
        <label>
          Cycle day
          <input
            type="number"
            value={cycleDay}
            min={1}
            max={60}
            onChange={(e) => setCycleDay(Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label>
          Energy
          <select value={energy} onChange={(e) => setEnergy(e.target.value as any)} style={inputStyle}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>

        <label>
          Minutes available
          <input
            type="number"
            value={minutesAvailable}
            min={5}
            max={240}
            onChange={(e) => setMinutesAvailable(Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label>
          Equipment
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="none / gym / dumbbells + mat"
            style={inputStyle}
          />
        </label>

        <label>
          Soreness / pain
          <input
            value={soreness}
            onChange={(e) => setSoreness(e.target.value)}
            placeholder="tight calves, sore shoulders…"
            style={inputStyle}
          />
        </label>

        <label>
          Goal
          <input value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle} />
        </label>

        <label>
          Dietary prefs
          <input value={dietaryPrefs} onChange={(e) => setDietaryPrefs(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="sleep, stress, cramps, travel, etc."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        <button onClick={generate} disabled={loading} style={buttonStyle(loading)}>
          {loading ? "Generating…" : "Generate today’s plan"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 12, border: "1px solid #f1c0c0" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {plan && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: "1px solid #e5e5e5" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Today Plan</h2>
              <p style={{ margin: "6px 0 0 0", opacity: 0.8 }}>
                <b>Phase:</b> {plan.phase} • <b>Focus:</b> {plan.todaysFocus}
              </p>
            </div>

            <button onClick={copyPlan} style={copyBtnStyle}>
              Copy
            </button>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <h3>Workout</h3>
          <p style={{ marginTop: 0 }}>
            <b>{plan.workout.title}</b> • {plan.workout.durationMinutes} min • {plan.workout.intensity}
          </p>
          <Section title="Warmup" items={plan.workout.warmup} />
          <Section title="Main Set" items={plan.workout.mainSet} />
          <Section title="Cooldown" items={plan.workout.cooldown} />
          {plan.workout.modifications?.length > 0 && <Section title="Modifications" items={plan.workout.modifications} />}

          <h3>Nutrition</h3>
          <p style={{ marginTop: 0, opacity: 0.9 }}>
            <b>Theme:</b> {plan.nutrition.theme}
          </p>
          <Section title="Meals" items={plan.nutrition.meals} />
          <Section title="Hydration" items={plan.nutrition.hydration} />

          <h3>Recovery</h3>
          <Section title="Practices" items={plan.recovery.practices} />
          <p>
            <b>Sleep tip:</b> {plan.recovery.sleepTip}
          </p>

          <h3>Mindset (5 minutes)</h3>
          <Section title="Practice" items={plan.mindset.fiveMinutePractice} />
          <p>
            <b>Mantra:</b> {plan.mindset.mantra}
          </p>

          <h3>Safety</h3>
          <Section title="Notes" items={plan.safetyNotes} />
        </div>
      )}
    </main>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <b>{title}</b>
      <ul style={{ marginTop: 8 }}>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginTop: 6,
};

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  gridColumn: "1 / -1",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #111",
  background: loading ? "#f2f2f2" : "#111",
  color: loading ? "#111" : "#fff",
  cursor: loading ? "not-allowed" : "pointer",
  fontWeight: 600,
  marginTop: 6,
});

const copyBtnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  height: 42,
};
