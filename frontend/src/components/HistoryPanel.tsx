import "../styles/HistoryPanel.css";

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    runs: any[];
}

export default function HistoryPanel({ isOpen, onClose, runs }: HistoryPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="history-overlay">
            <div className="history-backdrop" onClick={onClose}></div>
            <div className="history-panel">
                <div className="history-header">
                    <h3>Recent Activity</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="history-content">
                    {runs.length === 0 ? (
                        <div className="history-empty">No recent runs.</div>
                    ) : (
                        runs.map((run) => (
                            <div key={run.id} className="history-item">
                                <div className="history-item-header">
                                    <span className={`status-dot ${run.status === "success" ? "success" : "failure"}`}></span>
                                    <span className="timestamp">
                                        {new Date(run.timestamp * 1000).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="workflow-ref">{run.workflow_name || "Unnamed"}</div>

                                {run.results && (
                                    <div className="run-logs">
                                        {run.results.map((r: any, i: number) => (
                                            <div key={i} className="log-entry">
                                                <span className="log-tool">{r.tool}:</span> {r.output || r.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
