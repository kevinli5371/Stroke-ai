import { useState, useEffect } from 'react';
import "../styles/WorkflowDetail.css";

interface WorkflowDetailProps {
    workflow: any;
    onUpdate: (id: string, workflowData: any) => void;
    onDelete: (id: string) => void;
}

export default function WorkflowDetail({ workflow, onUpdate, onDelete }: WorkflowDetailProps) {
    const [name, setName] = useState(workflow.name || "");
    const [hotkey, setHotkey] = useState(workflow.hotkey || { mods: [], key: "" });
    const steps = workflow.steps || []; // Steps are now static prop-based, no local state needed for editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    // Sync state if workflow prop changes
    useEffect(() => {
        setName(workflow.name || "");
        setHotkey(workflow.hotkey || { mods: [], key: "" });
    }, [workflow.id]);

    const handleSave = () => {
        onUpdate(workflow.id, {
            ...workflow,
            name,
            hotkey
        });
    };

    const toggleMod = (mod: string) => {
        setHotkey((prev: { mods: string[]; key: string }) => {
            const hasMod = prev.mods.includes(mod);
            const newMods = hasMod
                ? prev.mods.filter((m: string) => m !== mod)
                : [...prev.mods, mod];
            return { ...prev, mods: newMods };
        });
    };

    return (
        <div className="workflow-detail">
            <header className="detail-header">
                <div className="header-left">
                    <div className="title-section">
                        {isEditingTitle ? (
                            <input
                                className="title-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            />
                        ) : (
                            <h2 onClick={() => setIsEditingTitle(true)}>{name || "Untitled Workflow"}</h2>
                        )}
                    </div>

                    <div className="hotkey-editor">
                        <span className="hotkey-label">Shortcut:</span>
                        <div className="mods-group">
                            {["cmd", "alt", "ctrl", "shift"].map(mod => (
                                <label key={mod} className={`mod-chip ${hotkey.mods.includes(mod) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={hotkey.mods.includes(mod)}
                                        onChange={() => toggleMod(mod)}
                                        style={{ display: 'none' }}
                                    />
                                    {mod}
                                </label>
                            ))}
                        </div>
                        <input
                            className="key-input"
                            value={hotkey.key}
                            onChange={(e) => setHotkey((prev: { mods: string[]; key: string }) => ({ ...prev, key: e.target.value.toUpperCase().slice(0, 1) }))}
                            placeholder="K"
                            maxLength={1}
                        />
                    </div>
                </div>

                <div className="header-actions">
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                    <button className="delete-btn" onClick={() => onDelete(workflow.id)}>Delete</button>
                </div>
            </header>

            <div className="timeline-container">
                {steps.map((step: any, idx: number) => (
                    <div key={idx} className="timeline-step">
                        <div className="step-marker">
                            <div className="marker-dot"></div>
                            {idx !== steps.length - 1 && <div className="marker-line"></div>}
                        </div>

                        <div className="step-content card">
                            <div className="step-header">
                                <span className="step-number">Step {idx + 1}</span>
                            </div>

                            <div className="step-field-group">
                                <label>Tool</label>
                                <input
                                    value={step.tool || ""}
                                    readOnly
                                    className="step-input"
                                />
                            </div>

                            <div className="step-field-group">
                                <label>Input</label>
                                <textarea
                                    value={JSON.stringify(step.input || {}, null, 2)}
                                    readOnly
                                    className="step-textarea"
                                    style={{ resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="timeline-end">
                    <div className="marker-dot end"></div>
                    <span>End of Workflow</span>
                </div>
            </div>
        </div>
    );
}
