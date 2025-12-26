import "../styles/Sidebar.css";

interface SidebarProps {
    workflows: any[];
    selectedId: string | null;
    onSelectWorkflow: (id: string) => void;
    onNewChat: () => void;
    className?: string;
}

export default function Sidebar({ workflows, selectedId, onSelectWorkflow, onNewChat, className = "" }: SidebarProps) {
    return (
        <aside className={`sidebar ${className}`}>
            <div className="sidebar-header">
                <button className="new-workflow-btn" onClick={onNewChat}>
                    New workflow
                </button>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-section-label">Workflows</div>
                <ul className="workflow-list">
                    {workflows.map((wf) => (
                        <li key={wf.id}>
                            <button
                                className={`workflow-item ${selectedId === wf.id ? "active" : ""}`}
                                onClick={() => onSelectWorkflow(wf.id)}
                            >
                                <span className="workflow-name">{wf.name || "New Workflow"}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Footer removed for minimalist look */}
        </aside>
    );
}
