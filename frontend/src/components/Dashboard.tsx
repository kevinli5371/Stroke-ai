import { useState, useEffect } from "react";
import Settings from "./Settings";
import "../styles/Dashboard.css";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("home"); // home, runs, settings
    const [command, setCommand] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [workflowsError, setWorkflowsError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentRuns, setRecentRuns] = useState<any[]>([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [runsError, setRunsError] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchWorkflows();
        fetchRecentRuns();

        if (window.ipcRenderer) {
            window.ipcRenderer.on('run-history-updated', fetchRecentRuns);
        }
        return () => {
            if (window.ipcRenderer) {
                window.ipcRenderer.removeAllListeners('run-history-updated');
            }
        };
    }, []);

    async function fetchWorkflows() {
        try {
            setWorkflowsLoading(true);
            const wfs = await window.electron.getWorkflows();
            setWorkflows(wfs);
        } catch (e: unknown) {
            setWorkflowsError(e instanceof Error ? e.message : String(e));
        } finally {
            setWorkflowsLoading(false);
        }
    }

    async function fetchRecentRuns() {
        try {
            if (window.electron && window.electron.getRunHistory) {
                const history = await window.electron.getRunHistory();
                setRecentRuns(history || []);
            }
        } catch (e: unknown) {
            setRunsError(e instanceof Error ? e.message : String(e));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!command.trim()) return;

        try {
            setLoading(true);
            const data = await window.electron.planWorkflow(command.trim());
            if (data.status !== "success") throw new Error(data.message || "Failed");

            if (data.workflow) {
                await window.electron.saveWorkflow(data.workflow);
                await fetchWorkflows();
                setCommand(""); // Reset command on success
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editHotkey, setEditHotkey] = useState<{ mods: string[]; key: string }>({ mods: [], key: "" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function startEditing(workflow: any) {
        setEditingId(workflow.id);
        setEditName(workflow.name || "");
        setEditHotkey(workflow.hotkey || { mods: ["cmd", "alt"], key: "" });
    }

    async function handleSaveEdit(id: string) {
        try {
            await window.electron.saveWorkflow({ id, name: editName, hotkey: editHotkey });
            setEditingId(null);
            fetchWorkflows();
        } catch (e) {
            alert(String(e));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this workflow?")) return;
        try {
            await window.electron.deleteWorkflow(id);
            fetchWorkflows();
        } catch (e) {
            alert(String(e));
        }
    }

    // Render Side Panel
    const renderSidebar = () => (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <span>Stroke.ai</span>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    Home
                </button>
                <button
                    className={`nav-item ${activeTab === 'runs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('runs')}
                >
                    Run History
                </button>
                <button
                    className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="status-indicator placeholder">placeholder</div>
            </div>
        </aside>
    );

    // Render Main Content
    return (
        <div className="app-container">
            {renderSidebar()}

            <main className="main-content">
                {activeTab === 'settings' ? (
                    <Settings onBack={() => setActiveTab('home')} />
                ) : (
                    <>
                        <header className="content-header">
                            <h1>{activeTab === 'home' ? 'My Workflows' : 'Activity Log'}</h1>
                            <div className="header-actions">
                                {/* Place for global actions if needed */}
                            </div>
                        </header>

                        {activeTab === 'home' && (
                            <>
                                {/* Command Input Card */}
                                <div className="card command-card">
                                    <h2>Create New</h2>
                                    <form onSubmit={handleSubmit}>
                                        <input
                                            type="text"
                                            placeholder="Describe a workflow..."
                                            value={command}
                                            onChange={(e) => setCommand(e.target.value)}
                                            disabled={loading}
                                        />
                                        <button type="submit" disabled={loading || !command.trim()}>
                                            {loading ? "Generating..." : "Create"}
                                        </button>
                                    </form>
                                    {error && <div className="error-badge">{error}</div>}
                                </div>

                                {workflowsError && <div className="error-banner">{workflowsError}</div>}

                                <MasonryGrid
                                    items={workflows}
                                    renderItem={(wf) => (
                                        <div key={wf.id} className="card workflow-card">
                                            {editingId === wf.id ? (
                                                <div className="edit-mode">
                                                    <input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="edit-name-input"
                                                    />
                                                    <div className="edit-hotkey-simple">
                                                        {["cmd", "alt", "ctrl", "shift"].map(mod => (
                                                            <label key={mod} className={`mod-chip ${editHotkey.mods.includes(mod) ? 'selected' : ''}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editHotkey.mods.includes(mod)}
                                                                    onChange={e => {
                                                                        const newMods = e.target.checked
                                                                            ? [...editHotkey.mods, mod]
                                                                            : editHotkey.mods.filter(m => m !== mod);
                                                                        setEditHotkey({ ...editHotkey, mods: newMods });
                                                                    }}
                                                                />
                                                                {mod}
                                                            </label>
                                                        ))}
                                                        <input
                                                            className="key-input"
                                                            value={editHotkey.key}
                                                            onChange={e => setEditHotkey({ ...editHotkey, key: e.target.value.toUpperCase().slice(0, 1) })}
                                                            placeholder="K"
                                                        />
                                                    </div>
                                                    <div className="edit-actions">
                                                        <button onClick={() => handleSaveEdit(wf.id)}>Save</button>
                                                        <button onClick={() => setEditingId(null)} className="secondary">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="card-header">
                                                        <div className="card-title">{wf.name || "Untitled"}</div>
                                                        <div className="card-menu">
                                                            <button onClick={() => startEditing(wf)}>Edit</button>
                                                            <button onClick={() => handleDelete(wf.id)}>Del</button>
                                                        </div>
                                                    </div>
                                                    <div className="hotkey-badge">
                                                        {wf.hotkey?.mods?.join("+")} + {wf.hotkey?.key}
                                                    </div>
                                                    {wf.steps && wf.steps.length > 0 && (
                                                        <div className="steps-list">
                                                            {wf.steps.map((s: any, idx: number) => (
                                                                <div key={idx} className="step-item">
                                                                    - {s.tool} {s.input && Object.keys(s.input).length > 0 ? `(${JSON.stringify(s.input)})` : ""}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                />
                                {workflowsLoading && <div className="loading-state">Loading workflows...</div>}
                            </>
                        )}

                        {activeTab === 'runs' && (
                            <div className="runs-list-container">
                                {runsError && <div className="error-banner">{runsError}</div>}
                                {runsLoading && <div className="loading-state">Loading run history...</div>}

                                {recentRuns.map(run => (
                                    <div key={run.id} className="run-row">
                                        <div className="run-info">
                                            <div className="run-name">{run.workflowName || "Unknown Execution"}</div>
                                            <div className="run-time">{new Date(run.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div className={`run-status-pill ${run.status}`}>
                                            {run.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// Helper Component for Masonry Layout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MasonryGrid({ items, renderItem }: { items: any[], renderItem: (item: any) => React.ReactNode }) {
    const [columns, setColumns] = useState(3);

    useEffect(() => {
        const updateColumns = () => {
            // Main content width approximates
            // Sidebar is 250px. Window width?
            const width = window.innerWidth - 250 - 64; // -sidebar -padding
            if (width < 600) setColumns(1);
            else if (width < 900) setColumns(2);
            else if (width < 1200) setColumns(3);
            else setColumns(4);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Distribute items into columns (Shortest Column First)
    const columnItems = Array.from({ length: columns }, () => [] as typeof items);
    const columnHeights = new Array(columns).fill(0);

    items.forEach((item) => {
        // Estimate height: Base card (~100px) + step height (~25px per step)
        // This heuristic ensures we fill shorter columns first
        const stepCount = item.steps?.length || 0;
        const estimatedHeight = 100 + (stepCount * 25);

        // Find the column with the minimum accumulated height
        let minColIndex = 0;
        let minHeight = columnHeights[0];

        for (let i = 1; i < columns; i++) {
            if (columnHeights[i] < minHeight) {
                minHeight = columnHeights[i];
                minColIndex = i;
            }
        }

        columnItems[minColIndex].push(item);
        // Add card height PLUS the gap (24px = 1.5rem)
        // This prevents columns with many small cards from being underestimated
        columnHeights[minColIndex] += estimatedHeight + 24;
    });

    return (
        <div className="masonry-grid">
            {columnItems.map((col, i) => (
                <div key={i} className="masonry-column">
                    {col.map(item => renderItem(item))}
                </div>
            ))}
        </div>
    );
}
