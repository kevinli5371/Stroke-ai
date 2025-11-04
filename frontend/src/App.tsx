import "./App.css";
import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmed = command.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      // 1) Generate plan + runtime classification
      const genRes = await fetch(`${API}/api/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      });
      const genData = await genRes.json();
      if (!genRes.ok || genData.status !== "success" || !genData.plan) {
        throw new Error(genData?.detail || genData?.message || "Failed to generate plan");
      }
      const plan = genData.plan;
      const runtime = genData.runtime;

      // 2) Apply plan
      const applyRes = await fetch(`${API}/api/apply-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const applyData = await applyRes.json();
      if (!applyRes.ok) throw new Error(applyData?.detail || "Failed to apply plan");

      alert(`Shortcut installed (${runtime}). Hotkey: ${applyData.combo}`);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <h1>Input a command</h1>
        <input
          type="text"
          placeholder="Type your command here..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !command.trim()}>
          {loading ? "Working…" : "Submit"}
        </button>
        {err && <p>{err}</p>}
      </form>
    </main>
  );
}
