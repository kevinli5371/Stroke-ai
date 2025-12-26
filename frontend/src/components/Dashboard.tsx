import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import Sidebar from "./Sidebar";
import HomeView from "./HomeView";
import WorkflowDetail from "./WorkflowDetail";
import HistoryPanel from "./HistoryPanel";

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
    // Global Data State
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [recentRuns, setRecentRuns] = useState<any[]>([]);

    // UI State
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Loading/Error States
    const [loading, setLoading] = useState(false); // For submitting new command
    const [error, setError] = useState<string | null>(null);

    // Data Fetching
    async function fetchWorkflows() {
        try {
            const res = await fetch(`${API}/api/workflows`);
            const data = await res.json();
            if (data.status === "success") {
                setWorkflows(data.workflows || []);
            }
        } catch (e) {
            console.error("Failed to fetch workflows", e);
        }
    }

    async function fetchRecentRuns() {
        try {
            const res = await fetch(`${API}/api/run-history`);
            const data = await res.json();
            if (data.status === "success") {
                // Determine success/fail for logs if needed, for now just passing raw
                setRecentRuns(data.history || []);
            }
        } catch (e) {
            console.error("Failed to fetch runs", e);
        }
    }

    // Initial Load
    useEffect(() => {
        fetchWorkflows();
        fetchRecentRuns();

        // Poll for runs every 10s if history panel is open? 
        // Or just let user refresh. Let's start with fetch on mount.
    }, []);


    // We need command state here to pass to HomeView
    const [command, setCommand] = useState("");

    async function handleNewCommand(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = command.trim();
        if (!trimmed) return;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API}/api/plan-workflow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: trimmed }),
            });

            const data = await res.json();

            if (!res.ok || data.status !== "success") {
                throw new Error(data.message || "Failed to plan workflow");
            }

            // Success! 
            setCommand("");
            await fetchWorkflows(); // Refresh list to see new workflow

            // Optionally select the new workflow if ID is returned
            if (data.workflow_id) {
                setSelectedWorkflowId(data.workflow_id);
            } else {
                // If API doesn't return ID, we could guess it's the last one, 
                // or just let user find it. 
                // The current backend might NOT return workflow_id in plan-workflow response.
                // We'll leave it on HomeView for now, or just refresh sidebar.
            }

        } catch (err: any) {
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateWorkflow(id: string, updatedData: any) {
        try {
            // Optimistic update
            setWorkflows(prev => prev.map(w => w.id === id ? updatedData : w));

            const res = await fetch(`${API}/api/update-workflow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            const data = await res.json();
            if (data.status !== "success") {
                throw new Error(data.message);
            }
        } catch (e: any) {
            alert("Failed to save: " + e.message);
            fetchWorkflows(); // Revert
        }
    }

    async function handleDeleteWorkflow(id: string) {
        if (!confirm("Are you sure you want to delete this chat?")) return;

        try {
            const res = await fetch(`${API}/api/delete-workflow/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.status === "success") {
                if (selectedWorkflowId === id) setSelectedWorkflowId(null);
                fetchWorkflows();
            }
        } catch (e) {
            alert("Failed to delete");
        }
    }

    // Derived State
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

    return (
        <div className="app-container">
            <Sidebar
                workflows={workflows}
                selectedId={selectedWorkflowId}
                onSelectWorkflow={setSelectedWorkflowId}
                onNewChat={() => setSelectedWorkflowId(null)}
            />

            <div className="main-area">
                {/* Top Bar for Extra Actions */}
                <div className="top-bar">
                    <button
                        className="history-toggle-btn"
                        onClick={() => {
                            setIsHistoryOpen(!isHistoryOpen);
                            if (!isHistoryOpen) fetchRecentRuns();
                        }}
                    >
                        {isHistoryOpen ? "Hide History" : "Show History"}
                    </button>
                </div>

                {selectedWorkflow ? (
                    <WorkflowDetail
                        workflow={selectedWorkflow}
                        onUpdate={handleUpdateWorkflow}
                        onDelete={handleDeleteWorkflow}
                    />
                ) : (
                    <HomeView
                        command={command}
                        setCommand={setCommand}
                        loading={loading}
                        onSubmit={handleNewCommand}
                        error={error}
                    />
                )}
            </div>

            <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                runs={recentRuns}
            />
        </div>
    );
}
