import React from 'react';
import "../styles/HomeView.css";

interface HomeViewProps {
    command: string;
    loading: boolean;
    setCommand: (cmd: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    error: string | null;
}

export default function HomeView({ command, loading, setCommand, onSubmit, error }: HomeViewProps) {
    return (
        <div className="home-view">
            <div className="home-content">
                <h1 className="home-title">Create any keyboard shortcut you desire.</h1>

                <form onSubmit={onSubmit} className="home-input-container">
                    <input
                        type="text"
                        className="home-input"
                        placeholder="Enter your command..."
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className={`home-submit-btn ${!command.trim() ? "disabled" : ""}`}
                        disabled={loading || !command.trim()}
                    >
                        {loading ? <span className="spinner-small"></span> : "↑"}
                    </button>
                </form>

                {error && <div className="home-error">{error}</div>}
            </div>

            <div className="home-footer">
                Hi this is Stroke.ai - follow me on twitter at @kevinsnmszt
            </div>
        </div>
    );
}
