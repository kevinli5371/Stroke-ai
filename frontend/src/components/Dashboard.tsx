import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
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

            // limit to 10 runs but can be more (up to 50)
            setRecentRuns(data.history.slice(0, 10) || []);
            // setRecentRuns(data.history || []);

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
            // console.error(err);
            alert(err?.message || String(err));
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editHotkey, setEditHotkey] = useState<{ mods: string[]; key: string }>({
        mods: [],
        key: "",
    });

    async function handleSaveEdit(id: string) {
        try {
            setWorkflowsLoading(true);
            const res = await fetch(`${API}/api/update-workflow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    name: editName,
                    hotkey: editHotkey,
                }),
            });
            const data = await res.json();
            if (data.status !== "success") {
                throw new Error(data.message || "Failed to update workflow");
            }
            setEditingId(null);
            await fetchWorkflows(); // refresh list
        } catch (e: any) {
            alert(e?.message || String(e));
            setWorkflowsError(e?.message || String(e));
        } finally {
            setWorkflowsLoading(false);
        }
    }

    function startEditing(workflow: any) {
        setEditingId(workflow.id);
        setEditName(workflow.name || "");
        setEditHotkey(
            workflow.hotkey || { mods: ["cmd", "alt"], key: "" }
        );
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

            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Saved workflows</h2>
                    <button onClick={fetchWorkflows} disabled={workflowsLoading}>
                        {workflowsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {workflowsError && (
                    <p className="error-message">{workflowsError}</p>
                )}

                {workflows.length === 0 && !workflowsLoading && (
                    <p className="list-empty">No workflows yet. Create one from the form above.</p>
                )}

                {workflows.length > 0 && (
                    <ul className="dashboard-list">
                        {workflows.map((workflow) => (
                            <li key={workflow.id} className="list-item">
                                {editingId === workflow.id ? (
                                    <div className="edit-form-container">
                                        {/* EDIT MODE */}
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Workflow Name"
                                            className="edit-input"
                                        />

                                        <div className="edit-hotkey-row">
                                            <span style={{ opacity: 0.8 }}>Mods:</span>
                                            {["cmd", "alt", "ctrl", "shift"].map((mod) => (
                                                <label key={mod} className="edit-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={editHotkey.mods.includes(mod)}
                                                        onChange={(e) => {
                                                            setEditHotkey(prev => {
                                                                const newMods = e.target.checked
                                                                    ? [...prev.mods, mod]
                                                                    : prev.mods.filter(m => m !== mod);
                                                                return { ...prev, mods: newMods };
                                                            });
                                                        }}
                                                    />
                                                    {mod}
                                                </label>
                                            ))}

                                            <span style={{ opacity: 0.8, marginLeft: "0.5rem" }}>Key:</span>
                                            <input
                                                type="text"
                                                value={editHotkey.key}
                                                onChange={(e) => setEditHotkey(prev => ({ ...prev, key: e.target.value.toUpperCase().slice(0, 1) }))}
                                                className="edit-key-input"
                                                maxLength={1}
                                            />
                                        </div>

                                        <div className="edit-actions">
                                            <button onClick={() => handleSaveEdit(workflow.id)} disabled={workflowsLoading}>Save</button>
                                            <button onClick={() => setEditingId(null)} disabled={workflowsLoading}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* DISPLAY MODE */}
                                        <div className="item-header">
                                            <div>
                                                <div className="item-title">
                                                    {workflow.name || "(unnamed workflow)"}
                                                </div>

                                                {workflow.hotkey && (
                                                    <div className="item-subtitle">
                                                        Hotkey:{" "}
                                                        {workflow.hotkey.mods && workflow.hotkey.mods.length > 0
                                                            ? workflow.hotkey.mods.join(" + ") + " + "
                                                            : ""}
                                                        {workflow.hotkey.key}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="item-actions">
                                                <button
                                                    onClick={() => startEditing(workflow)}
                                                    className="action-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(workflow.id)}
                                                    className="action-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {workflow.steps && workflow.steps.length > 0 && (
                                            <div className="steps-display">
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
                                    </>
                                )}
                            </li>
                        ))}

                    </ul>
                )}
            </section>

            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Runs</h2>
                    <button onClick={fetchRecentRuns} disabled={runsLoading}>
                        {runsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {runsError && (
                    <p className="error-message">{runsError}</p>
                )}

                {recentRuns.length === 0 && !runsLoading && (
                    <p className="list-empty">No runs recorded yet.</p>
                )}

                {recentRuns.length > 0 && (
                    <ul className="dashboard-list">
                        {recentRuns.map((run) => (
                            <li key={run.id} className="list-item">
                                <div className="item-header">
                                    <div className="item-title">
                                        {run.workflow_name || "(unnamed)"}
                                    </div>
                                    <div className="item-meta">
                                        {(() => {
                                            const date = new Date(run.timestamp * 1000);
                                            const today = new Date();
                                            const isToday = date.getDate() === today.getDate() &&
                                                date.getMonth() === today.getMonth() &&
                                                date.getFullYear() === today.getFullYear();
                                            return isToday ? date.toLocaleTimeString() : date.toLocaleString();
                                        })()}
                                    </div>
                                </div>

                                <div className="run-status">
                                    Status: <span className={run.status === "success" ? "status-success" : "status-failure"}>{run.status}</span>
                                </div>

                                {run.results && (
                                    <div className="run-results">
                                        {run.results.map((r: any, idx: number) => (
                                            <div key={idx} className="result-item">
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
