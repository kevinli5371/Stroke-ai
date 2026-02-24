import { useState, useEffect, useRef, useCallback } from "react";
import Settings from "./Settings";
import { mapKeyboardEventToElectronKey } from "../utils/keyboard";
import "../styles/Dashboard.css";

const TOOL_COLORS: Record<string, { bg: string; text: string }> = {
    debug_log:           { bg: "rgba(158,158,158,0.15)", text: "#9e9e9e" },
    wait:                { bg: "rgba(158,158,158,0.15)", text: "#9e9e9e" },
    open_url:            { bg: "rgba(96,165,250,0.15)",  text: "#60a5fa" },
    open_app:            { bg: "rgba(129,140,248,0.15)", text: "#818cf8" },
    focus_url_bar:       { bg: "rgba(56,189,248,0.15)",  text: "#38bdf8" },
    copy_selection:      { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
    paste_clipboard:     { bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
    append_to_clipboard: { bg: "rgba(45,212,191,0.15)",  text: "#2dd4bf" },
    replace_clipboard:   { bg: "rgba(16,185,129,0.15)",  text: "#10b981" },
    transform_clipboard: { bg: "rgba(192,132,252,0.15)", text: "#c084fc" },
    analyze_screen:      { bg: "rgba(232,121,249,0.15)", text: "#e879f9" },
    snap_window:         { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
    press_enter:         { bg: "rgba(251,146,60,0.15)",  text: "#fb923c" },
    press_key:           { bg: "rgba(244,114,82,0.15)",  text: "#f47252" },
    capture_screen:      { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
    show_sticky_note:    { bg: "rgba(253,224,71,0.15)",  text: "#fde047" },
};

const TOOL_LABELS: Record<string, string> = {
    debug_log: "Log",
    wait: "Wait",
    open_url: "Open URL",
    open_app: "Open App",
    focus_url_bar: "URL Bar",
    copy_selection: "Copy",
    paste_clipboard: "Paste",
    append_to_clipboard: "Append",
    replace_clipboard: "Replace",
    transform_clipboard: "Transform",
    analyze_screen: "Analyze",
    snap_window: "Snap",
    press_enter: "Enter",
    press_key: "Key",
    capture_screen: "Capture",
    show_sticky_note: "Sticky Note",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatStepValue(tool: string, input: any): string {
    if (!input || Object.keys(input).length === 0) return "";
    const sub = (v: unknown) => v === "$PREVIOUS_RESULT" ? "previous result" : String(v);

    switch (tool) {
        case "wait":
            return `${input.seconds}s`;
        case "press_key": {
            const mods = input.mods?.length ? input.mods.join("+") + "+" : "";
            return mods + sub(input.key);
        }
        case "snap_window":
            return input.app_name ? `${sub(input.target)} · ${sub(input.app_name)}` : sub(input.target);
        default: {
            const vals = Object.values(input).filter(v => v !== undefined && v !== null);
            return vals.map(sub).join(" · ");
        }
    }
}

function truncateText(str: string, max: number): string {
    if (str.length <= max) return str;
    return str.slice(0, max) + "…";
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("home"); // home, runs, settings
    const [command, setCommand] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [overlayHotkey, setOverlayHotkey] = useState<{ mods: string[], key: string }>({ mods: ["cmd", "alt"], key: "O" });
    const [isSettingsValid, setIsSettingsValid] = useState(true);

    // Data State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [workflowsError, setWorkflowsError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentRuns, setRecentRuns] = useState<any[]>([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [runsError, setRunsError] = useState<string | null>(null);

    function handleCloseModal() {
        setIsModalClosing(true);
        setTimeout(() => {
            setIsCreateModalOpen(false);
            setIsModalClosing(false);
        }, 200);
    }

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (isCreateModalOpen && e.key === "Escape") {
                handleCloseModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isCreateModalOpen]);

    // Initial Fetch
    useEffect(() => {
        // Load Theme
        if (window.electron?.getPreferences) {
            window.electron.getPreferences().then(prefs => {
                if (prefs.theme) {
                    document.documentElement.setAttribute('data-theme', prefs.theme);
                }
                if (prefs.overlayHotkey) {
                    setOverlayHotkey(prefs.overlayHotkey);
                }
            }).catch(e => console.error("Failed to load theme", e));
        }

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
            setRunsLoading(true); // Indicate loading start
            if (window.electron && window.electron.getRunHistory) {
                const history = await window.electron.getRunHistory();
                setRecentRuns(history || []);
            }
        } catch (e: unknown) {
            setRunsError(e instanceof Error ? e.message : String(e));
        } finally {
            setRunsLoading(false); // Indicate loading end
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
                const newHk = data.workflow.hotkey;
                if (newHk) {
                    // Check vs Overlay
                    if (newHk.key === overlayHotkey.key &&
                        JSON.stringify([...(newHk.mods || [])].sort()) === JSON.stringify([...overlayHotkey.mods].sort())) {
                        throw new Error(`Generated hotkey ${newHk.mods.join("+")}+${newHk.key} conflicts with Overlay. Please try again.`);
                    }
                    // Check vs Existing
                    const isDuplicate = workflows.some(w =>
                        w.hotkey?.key === newHk.key &&
                        JSON.stringify([...(w.hotkey?.mods || [])].sort()) === JSON.stringify([...(newHk.mods || [])].sort())
                    );
                    if (isDuplicate) {
                        throw new Error(`Generated hotkey ${newHk.mods.join("+")}+${newHk.key} is already in use. Please try again.`);
                    }
                }

                await window.electron.saveWorkflow(data.workflow);
                await fetchWorkflows();
                await fetchWorkflows();
                setCommand(""); // Reset command on success
                handleCloseModal();
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
            // Find original to preserve "steps" and other fields
            const original = workflows.find(w => w.id === id);
            if (!original) throw new Error("Workflow not found");

            // Conflict Detection: Check for duplicate hotkeys
            const isDuplicate = workflows.some(w =>
                w.id !== id &&
                w.hotkey?.key === editHotkey.key &&
                JSON.stringify([...(w.hotkey?.mods || [])].sort()) === JSON.stringify([...editHotkey.mods].sort())
            );

            if (isDuplicate) {
                throw new Error(`Hotkey ${editHotkey.mods.join("+")}+${editHotkey.key} is already used by another workflow.`);
            }

            // Conflict Detection: Check against Overlay Hotkey
            const isOverlayConflict =
                editHotkey.key === overlayHotkey.key &&
                JSON.stringify([...editHotkey.mods].sort()) === JSON.stringify([...overlayHotkey.mods].sort());

            if (isOverlayConflict) {
                throw new Error(`Hotkey ${editHotkey.mods.join("+")}+${editHotkey.key} is reserved for the Overlay.`);
            }

            await window.electron.saveWorkflow({
                ...original,
                name: editName,
                hotkey: editHotkey
            });

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

    // Navigation Handler
    const handleNavigation = (tab: string) => {
        if (activeTab === 'settings' && !isSettingsValid) {
            // Shake/Alert logic could go here
            alert("Please resolve the Hotkey Conflict before leaving Settings.");
            return;
        }
        setActiveTab(tab);
    };

    // Render Side Panel
    const renderSidebar = () => (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <span>Stroke(ai)</span>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleNavigation('home')}
                >
                    Home
                </button>
                <button
                    className={`nav-item ${activeTab === 'runs' ? 'active' : ''}`}
                    onClick={() => handleNavigation('runs')}
                >
                    Run History
                </button>
            </nav>

            <div className="sidebar-footer">
                <button
                    className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('settings')}
                >
                    Settings
                </button>
            </div>
        </aside>
    );

    // Render Main Content
    return (
        <div className="app-container">
            {renderSidebar()}

            <main className="main-content">
                {activeTab === 'settings' ? (
                    <Settings onValidityChange={setIsSettingsValid} />
                ) : (
                    <>
                        <header className="content-header animate-slide-up" key={`${activeTab}-header`}>
                            <h1>{activeTab === 'home' ? 'My Workflows' : 'Activity Log'}</h1>
                            <div className="header-actions">
                                {activeTab === 'home' && (
                                    <button
                                        className="header-add-btn"
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsModalClosing(false);
                                        }}
                                        title="Create New Workflow"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </header>

                        {activeTab === 'home' && (
                            <>
                                {/* Create Workflow Modal */}
                                {isCreateModalOpen && (
                                    <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
                                        <div className={`modal-content ${isModalClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h2>Create New Workflow</h2>
                                                <button className="close-button" onClick={handleCloseModal}>×</button>
                                            </div>
                                            <div className="modal-body">
                                                <form onSubmit={handleSubmit}>
                                                    <textarea
                                                        placeholder="Describe what you want this workflow to do..."
                                                        value={command}
                                                        onChange={(e) => setCommand(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                if (command.trim() && !loading) {
                                                                    handleSubmit(e);
                                                                }
                                                            }
                                                        }}
                                                        disabled={loading}
                                                        autoFocus
                                                    />
                                                    <div className="modal-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            onClick={handleCloseModal}
                                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="btn-primary" disabled={loading || !command.trim()}>
                                                            {loading ? "Generating..." : "Create Workflow"}
                                                        </button>
                                                    </div>
                                                </form>
                                                {error && <div className="error-badge" style={{ marginTop: '1rem' }}>{error}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {workflowsError && <div className="error-banner animate-slide-up">{workflowsError}</div>}


                                {(!workflowsLoading && !workflowsError && workflows.length === 0) && (
                                    <div className="no-workflows-message animate-slide-up">
                                        click the "+" to create a new workflow
                                    </div>
                                )}

                                <div className="animate-slide-up">
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
                                                                onKeyDown={(e) => {
                                                                    const validKey = mapKeyboardEventToElectronKey(e);
                                                                    if (validKey) {
                                                                        e.preventDefault();
                                                                        setEditHotkey({ ...editHotkey, key: validKey });
                                                                    }
                                                                }}
                                                                readOnly
                                                                placeholder="Key"
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
                                                                <button onClick={() => handleDelete(wf.id)} className="danger">Del</button>
                                                            </div>
                                                        </div>
                                                        <div className="hotkey-badge">
                                                            {wf.hotkey?.mods?.join("+")} + {wf.hotkey?.key}
                                                        </div>
                                                        {wf.steps && wf.steps.length > 0 && (
                                                            <div className="steps-list">
                                                                {wf.steps.map((s: any, idx: number) => (
                                                                    <StepPill key={idx} step={s} />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                                {workflowsLoading && <div className="loading-state animate-slide-up">Loading workflows...</div>}
                            </>
                        )}

                        {activeTab === 'runs' && (
                            <div className="runs-list-container animate-slide-up">
                                {runsError && <div className="error-banner">{runsError}</div>}
                                {runsLoading && <div className="loading-state">Loading run history...</div>}

                                {recentRuns.map(run => (
                                    <div key={run.id} className="run-row">
                                        <div className="run-info">
                                            <div className="run-name">{run.workflowName || "Unknown Execution"}</div>
                                            <div className="run-time">
                                                {(() => {
                                                    const d = new Date(run.timestamp);
                                                    const now = new Date();
                                                    const isToday = d.getDate() === now.getDate() &&
                                                        d.getMonth() === now.getMonth() &&
                                                        d.getFullYear() === now.getFullYear();

                                                    const yesterday = new Date(now);
                                                    yesterday.setDate(now.getDate() - 1);
                                                    const isYesterday = d.getDate() === yesterday.getDate() &&
                                                        d.getMonth() === yesterday.getMonth() &&
                                                        d.getFullYear() === yesterday.getFullYear();

                                                    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                    if (isToday) return `Today at ${timeStr}`;
                                                    if (isYesterday) return `Yesterday at ${timeStr}`;
                                                    return `${d.toLocaleDateString()} at ${timeStr}`;
                                                })()}
                                            </div>
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

function StepPill({ step }: { step: { tool: string; input?: Record<string, unknown> } }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const summaryRef = useRef<HTMLSpanElement>(null);
    const colors = TOOL_COLORS[step.tool] || { bg: "rgba(158,158,158,0.15)", text: "#9e9e9e" };
    const label = TOOL_LABELS[step.tool] || step.tool;
    const fullValue = formatStepValue(step.tool, step.input);
    const summary = truncateText(fullValue, 40);
    const isTruncatedByJs = fullValue.length > 40;
    const displayText = expanded ? fullValue : summary;

    const checkOverflow = useCallback(() => {
        const el = summaryRef.current;
        if (el && !expanded) {
            setIsOverflowing(el.scrollWidth > el.clientWidth);
        }
    }, [expanded]);

    useEffect(() => {
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [checkOverflow]);

    const isExpandable = isTruncatedByJs || isOverflowing;

    return (
        <div className="step-item">
            <div
                className={`step-pill-row ${isExpandable ? "expandable" : ""} ${expanded ? "expanded" : ""}`}
                onClick={() => isExpandable && setExpanded(!expanded)}
            >
                <span className="tool-pill-slot">
                    <span
                        className="tool-pill"
                        style={{ background: colors.bg, color: colors.text }}
                    >
                        {label}
                    </span>
                </span>
                {displayText && (
                    <span
                        ref={summaryRef}
                        className={`step-summary ${expanded ? "step-summary-expanded" : ""}`}
                    >
                        {displayText}
                    </span>
                )}
                {isExpandable && (
                    <span className={`step-chevron ${expanded ? "expanded" : ""}`}>›</span>
                )}
            </div>
        </div>
    );
}
