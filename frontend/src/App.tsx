import "./App.css";
import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [command, setCommand] = useState("");      // your natural language command
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState<string | null>(null);

  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  async function fetchWorkflows() {
    try {
      setWorkflowsError(null);
      setWorkflowsLoading(true);

      const res = await fetch(`${API}/api/workflows`);
      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to fetch workflows");
      }

      setWorkflows(data.workflows || []);
    } catch (e: any) {
      setWorkflowsError(e?.message || String(e));
    } finally {
      setWorkflowsLoading(false);
    }
  }

  async function fetchRecentRuns() {
    try {
      setRunsError(null);
      setRunsLoading(true);

      const res = await fetch(`${API}/api/run-history`);
      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to fetch run history");
      }

      setRecentRuns(data.history || []);
    } catch (e: any) {
      setRunsError(e?.message || String(e));
    } finally {
      setRunsLoading(false);
    }
  }


  useEffect(() => {
    fetchWorkflows();
    fetchRecentRuns();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = command.trim();
    if (!trimmed) {
      setError("Please enter a command");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/plan-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to plan workflow");
      }

    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setWorkflowsError(null);
      setWorkflowsLoading(true);

      const result = await fetch(`${API}/api/delete-workflow/${id}`, {
        method: "DELETE",
      });
      const data = await result.json();
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to delete workflow");
      }
      await fetchWorkflows();
    } catch (e: any) {
      setWorkflowsError(e?.message || String(e));
    } finally {
      setWorkflowsLoading(false);
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
        {error && <p>{error}</p>}
      </form>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Saved workflows</h2>
          <button onClick={fetchWorkflows} disabled={workflowsLoading}>
            {workflowsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {workflowsError && (
          <p style={{ color: "red", marginTop: "0.25rem" }}>{workflowsError}</p>
        )}

        {workflows.length === 0 && !workflowsLoading && (
          <p style={{ opacity: 0.8 }}>No workflows yet. Create one from the form above.</p>
        )}

        {workflows.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
            {workflows.map((workflow) => (
              <li
                key={workflow.id}
                style={{
                  padding: "0.5rem 0.25rem",
                  borderTop: "1px solid #444",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {workflow.name || "(unnamed workflow)"}
                    </div>

                    {workflow.hotkey && (
                      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                        Hotkey:{" "}
                        {workflow.hotkey.mods && workflow.hotkey.mods.length > 0
                          ? workflow.hotkey.mods.join(" + ") + " + "
                          : ""}
                        {workflow.hotkey.key}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(workflow.id)}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      border: "1px solid #666",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>

                {workflow.steps && workflow.steps.length > 0 && (
                  <div style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                    <span style={{ opacity: 0.8 }}>Steps:</span>{" "}
                    {workflow.steps
                      .map(
                        (s: any) =>
                          s.tool +
                          (s.input && Object.keys(s.input).length > 0
                            ? `(${JSON.stringify(s.input)})`
                            : "")
                      )
                      .join(" → ")}
                  </div>
                )}
              </li>
            ))}

          </ul>
        )}
      </section>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Recent Runs</h2>
          <button onClick={fetchRecentRuns} disabled={runsLoading}>
            {runsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {runsError && (
          <p style={{ color: "red", marginTop: "0.25rem" }}>{runsError}</p>
        )}

        {recentRuns.length === 0 && !runsLoading && (
          <p style={{ opacity: 0.8 }}>No runs recorded yet.</p>
        )}

        {recentRuns.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
            {recentRuns.map((run) => (
              <li
                key={run.id}
                style={{
                  padding: "0.5rem 0.25rem",
                  borderTop: "1px solid #444",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {run.workflow_name || "(unnamed)"}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {new Date(run.timestamp * 1000).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Status: <span style={{ color: run.status === "success" ? "#4caf50" : "#f44336" }}>{run.status}</span>
                </div>

                {run.results && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.9 }}>
                    {run.results.map((r: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 600 }}>{r.tool}:</span>{" "}
                        <span>{r.output || r.message || "(no output)"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

    </main>
  );
}
