import "./App.css";
import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  //new: hotkeys state
  const [hotkeys, setHotkeys] = useState<Array<{name: string; combo: string}>>([]);

  async function fetchHotkeys() {
    try {
      const res = await fetch(`${API}/api/list-hotkeys`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setHotkeys(data.commands);
      } else {
        throw new Error(data?.detail || data?.message || "Failed to fetch hotkeys");
      }
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  useEffect(() => {
    fetchHotkeys();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmed = command.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      // 0) Check Hammerspoon running
      const hsRes = await fetch(`${API}/api/hs-running`);
      const hsData = await hsRes.json();
      if (!hsData.running) {
        throw new Error("Hammerspoon is not running. Please start Hammerspoon and try again.");
      }

      // 1) Generate plan + runtime classification
      const genRes = await fetch(`${API}/api/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      });
      const genData = await genRes.json();
      if (genData.status !== "success") {
        throw new Error("Failed to generate plan");
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

     // refresh the installed hotkeys list so the UI updates
     await fetchHotkeys();

      alert(`Shortcut installed (${runtime}). Hotkey: ${applyData.combo}`);
    } catch (e: any) {
      setErr(e.message || String(e));
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
      {/* display installed hotkeys*/}
      <section>
        <h2>Installed Hotkeys</h2>
        {hotkeys.length === 0 ? (
          <p>No hotkeys installed yet.</p>
        ) : (
          <ul>
            {hotkeys.map((hk) => (
              <li key={hk.combo}>
                {hk.name} - {hk.combo}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
