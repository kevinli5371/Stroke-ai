import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

import "../styles/Dashboard.css";

export default function Dashboard() {
    const [command, setCommand] = useState("");      // your natural language command
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [workflowsError, setWorkflowsError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentRuns, setRecentRuns] = useState<any[]>([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [runsError, setRunsError] = useState<string | null>(null);

    async function fetchWorkflows() {
        try {
            setWorkflowsError(null);
            setWorkflowsLoading(true);

            const wfs = await window.electron.getWorkflows();
            setWorkflows(wfs);

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setWorkflowsError(msg);
        } finally {
            setWorkflowsLoading(false);
        }
    }

    async function fetchRecentRuns() {
        try {
            setRunsError(null);
            setRunsLoading(true);

            if (window.electron && window.electron.getRunHistory) {
                const history = await window.electron.getRunHistory();
                setRecentRuns(history || []);
            } else {
                console.warn("Electron API not available");
                setRecentRuns([]);
            }

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setRunsError(msg);
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
            const data = await window.electron.planWorkflow(trimmed);

            if (data.status !== "success") {
                throw new Error(data.message || "Failed to plan workflow");
            }

            // Immediately save the planned workflow locally
            if (data.workflow) {
                await window.electron.saveWorkflow(data.workflow);
                await fetchWorkflows();
            }

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert(msg);
            setError(msg);
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
            await window.electron.saveWorkflow({
                id,
                name: editName,
                hotkey: editHotkey,
            });
            setEditingId(null);
            await fetchWorkflows(); // refresh list
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            alert(msg);
            setWorkflowsError(msg);
        } finally {
            setWorkflowsLoading(false);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function startEditing(workflow: any) {
        setEditingId(workflow.id);
        setEditName(workflow.name || "");
        setEditHotkey(
            workflow.hotkey || { mods: ["cmd", "alt"], key: "" }
        );
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Are you sure you want to delete this workflow?")) return;

        try {
            setWorkflowsError(null);
            setWorkflowsLoading(true);

            await window.electron.deleteWorkflow(id);
            await fetchWorkflows();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setWorkflowsError(msg);
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
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                        {run.workflowName || "(unnamed)"}
                                    </div>
                                    <div className="item-meta">
                                        {(() => {
                                            const date = new Date(run.timestamp);
                                            const today = new Date();
                                            const isToday = date.getDate() === today.getDate() &&
                                                date.getMonth() === today.getMonth() &&
                                                date.getFullYear() === today.getFullYear();
                                            return isToday ? "Today " + date.toLocaleTimeString() : date.toLocaleString();
                                        })()}
                                    </div>
                                </div>

                                <div className="run-status">
                                    Status: <span className={run.status === "success" ? "status-success" : "status-failure"}>{run.status}</span>
                                </div>

                                {
                                    run.results && (
                                        <div className="run-results">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {run.results.map((r: any, idx: number) => (
                                                <div key={idx} className="result-item">
                                                    <span style={{ fontWeight: 600 }}>{r.tool}:</span>{" "}
                                                    <span>{r.output || r.message || "(no output)"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </main >
    );
}
