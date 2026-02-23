import { useState, useEffect } from 'react';
import { mapKeyboardEventToElectronKey } from '../utils/keyboard';
import '../styles/Dashboard.css'; // Reuse existing styles for consistency

interface SettingsProps {
    onValidityChange?: (isValid: boolean) => void;
}

export default function Settings({ onValidityChange }: SettingsProps) {
    const [apiKey, setApiKey] = useState("");
    const [defaultBrowser, setDefaultBrowser] = useState("Google Chrome");
    const [initialLoad, setInitialLoad] = useState(false);
    const [theme, setTheme] = useState("dark");
    const [overlayHotkey, setOverlayHotkey] = useState<{ mods: string[], key: string }>({ mods: ["cmd", "alt"], key: "O" });

    // Model selection state
    const [modelType, setModelType] = useState<"openai" | "local">("openai");
    const [modelDownloaded, setModelDownloaded] = useState(false);
    const [modelDownloading, setModelDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [modelError, setModelError] = useState<string | null>(null);

    // Conflict detection state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [workflows, setWorkflows] = useState<any[]>([]);

    useEffect(() => {
        // Load initial settings
        async function load() {
            try {
                if (window.electron && window.electron.getPreferences) {
                    const prefs = await window.electron.getPreferences();
                    setApiKey(prefs.apiKey || "");
                    setDefaultBrowser(prefs.defaultBrowser || "Google Chrome");
                    setTheme(prefs.theme || "dark");
                    setModelType(prefs.modelType || "openai");
                    if (prefs.overlayHotkey) {
                        setOverlayHotkey(prefs.overlayHotkey);
                    }
                }
                // Check local model status
                if (window.electron && window.electron.modelCheckDownloaded) {
                    const downloaded = await window.electron.modelCheckDownloaded();
                    setModelDownloaded(downloaded);
                }
                // Load workflows for conflict detection
                if (window.electron && window.electron.getWorkflows) {
                    const wfs = await window.electron.getWorkflows();
                    setWorkflows(wfs);
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setInitialLoad(true); // Ensure we mark load as complete
            }
        }
        load();
    }, []);

    // Listen for download progress events from main process
    useEffect(() => {
        const handler = (_event: unknown, percent: number) => {
            setDownloadProgress(percent);
            if (percent >= 100) {
                setModelDownloading(false);
                setModelDownloaded(true);
            }
        };
        if (window.ipcRenderer) {
            window.ipcRenderer.on('model:download-progress', handler);
        }
        return () => {
            if (window.ipcRenderer) {
                window.ipcRenderer.removeAllListeners('model:download-progress');
            }
        };
    }, []);

    const savePreferences = async (newPrefs: { apiKey: string, defaultBrowser: string, theme: string, overlayHotkey?: { mods: string[], key: string }, modelType?: "openai" | "local" }) => {
        try {
            await window.electron.savePreferences({
                apiKey: newPrefs.apiKey,
                defaultBrowser: newPrefs.defaultBrowser,
                theme: newPrefs.theme as "light" | "dark",
                overlayHotkey: newPrefs.overlayHotkey,
                modelType: newPrefs.modelType,
            });
        } catch (e) {
            console.error("Failed to auto-save settings", e);
        }
    };

    const handleModelDownload = async () => {
        setModelDownloading(true);
        setDownloadProgress(0);
        setModelError(null);
        try {
            const result = await window.electron.modelDownload();
            if (result.status === "error") {
                setModelError(result.message || "Download failed");
                setModelDownloading(false);
            }
            // Progress & completion handled by IPC listener above
        } catch (e) {
            setModelError(String(e));
            setModelDownloading(false);
        }
    };

    const handleModelCancel = async () => {
        try {
            await window.electron.modelCancelDownload();
        } catch { /* ignore */ }
        setModelDownloading(false);
        setDownloadProgress(0);
    };

    const handleModelDelete = async () => {
        try {
            await window.electron.modelDelete();
            setModelDownloaded(false);
        } catch (e) {
            setModelError(String(e));
        }
    };

    // Check for conflicts
    const getConflict = () => {
        const conflict = workflows.find(w =>
            w.hotkey?.key === overlayHotkey.key &&
            JSON.stringify([...(w.hotkey?.mods || [])].sort()) === JSON.stringify([...overlayHotkey.mods].sort())
        );
        return conflict ? `Conflict: "${conflict.name}" uses this hotkey.` : null;
    };

    const conflictError = getConflict();

    // Report Validity
    useEffect(() => {
        if (onValidityChange) {
            onValidityChange(!conflictError);
        }
    }, [conflictError, onValidityChange]);

    // Autosave API Key (Debounced)
    useEffect(() => {
        if (!initialLoad) return;
        const timer = setTimeout(() => {
            savePreferences({ apiKey, defaultBrowser, theme, overlayHotkey, modelType });
        }, 800);
        return () => clearTimeout(timer);
    }, [apiKey]);

    // Autosave others (Immediate, if valid)
    useEffect(() => {
        if (!initialLoad) return;
        if (!conflictError) {
            savePreferences({ apiKey, defaultBrowser, theme, overlayHotkey, modelType });
        }
    }, [defaultBrowser, theme, overlayHotkey, modelType]);

    // Apply theme immediately when changed in settings for preview
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1>Settings</h1>
            </header>

            <div className="settings-form">
                {/* ---- Model Provider Toggle ---- */}
                <div className="form-group">
                    <label>Model Provider</label>
                    <div className="model-selection">
                        <button
                            className={`model-option ${modelType === "openai" ? "selected" : ""}`}
                            onClick={() => setModelType("openai")}
                        >
                            <span className="model-option-radio" />
                            <div className="model-option-content">
                                <span className="model-option-title">OpenAI API</span>
                                <span className="model-option-desc">Cloud-based, fastest results</span>
                            </div>
                        </button>
                        <button
                            className={`model-option ${modelType === "local" ? "selected" : ""}`}
                            onClick={() => setModelType("local")}
                        >
                            <span className="model-option-radio" />
                            <div className="model-option-content">
                                <span className="model-option-title">Local Model</span>
                                <span className="model-option-desc">Privacy mode, runs on-device</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ---- OpenAI Section ---- */}
                {modelType === "openai" && (
                    <div className="form-group">
                        <label>OpenAI API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                        <p className="help-text">
                            Required for planning and transformations.
                            Stored locally on your device.
                        </p>
                    </div>
                )}

                {/* ---- Local Model Section ---- */}
                {modelType === "local" && (
                    <div className="form-group">
                        <label>Local Model (Phi-3.5 Mini)</label>

                        {/* Downloading state */}
                        {modelDownloading && (
                            <div className="model-download-status">
                                <div className="model-progress-bar">
                                    <div
                                        className="model-progress-bar-fill"
                                        style={{ width: `${downloadProgress}%` }}
                                    />
                                </div>
                                <div className="model-progress-label">
                                    <span>Downloading... {downloadProgress}%</span>
                                    <button className="model-link-btn" onClick={handleModelCancel}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Not downloaded */}
                        {!modelDownloading && !modelDownloaded && (
                            <div className="model-download-status">
                                <p className="model-status">
                                    <span className="model-status-dot not-ready" />
                                    Not downloaded (~2.3 GB required)
                                </p>
                                <button className="model-download-btn" onClick={handleModelDownload}>
                                    Download Model
                                </button>
                            </div>
                        )}

                        {/* Downloaded */}
                        {!modelDownloading && modelDownloaded && (
                            <div className="model-download-status">
                                <p className="model-status ready">
                                    <span className="model-status-dot ready" />
                                    Model downloaded — Ready to use
                                </p>
                                <button className="model-link-btn danger" onClick={handleModelDelete}>
                                    Delete Model
                                </button>
                            </div>
                        )}

                        {modelError && (
                            <p className="model-error">{modelError}</p>
                        )}

                        <p className="help-text">
                            Runs entirely on your Mac. No data leaves your device.
                            First use takes ~5-10s to load into memory.
                        </p>
                    </div>
                )}

                <div className="form-group">
                    <label>Theme</label>
                    <CustomSelect
                        value={theme}
                        onChange={setTheme}
                        options={[
                            { value: "dark", label: "Dark Mode" },
                            { value: "light", label: "Light Mode" },
                        ]}
                    />
                </div>

                <div className="form-group">
                    <label>Overlay Hotkey</label>
                    <div className="edit-hotkey-simple" style={{ marginTop: '0.5rem' }}>
                        {["cmd", "alt", "ctrl", "shift"].map(mod => (
                            <label key={mod} className={`mod-chip ${overlayHotkey.mods.includes(mod) ? 'selected' : ''} ${conflictError ? 'error' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={overlayHotkey.mods.includes(mod)}
                                    onChange={e => {
                                        const newMods = e.target.checked
                                            ? [...overlayHotkey.mods, mod]
                                            : overlayHotkey.mods.filter(m => m !== mod);
                                        setOverlayHotkey({ ...overlayHotkey, mods: newMods });
                                    }}
                                />
                                {mod}
                            </label>
                        ))}
                        <input
                            className={`key-input ${conflictError ? 'error' : ''}`}
                            value={overlayHotkey.key}
                            onKeyDown={(e) => {
                                const validKey = mapKeyboardEventToElectronKey(e);
                                if (validKey) {
                                    e.preventDefault();
                                    setOverlayHotkey({ ...overlayHotkey, key: validKey });
                                }
                            }}
                            readOnly
                            placeholder="Key"
                        />
                    </div>
                    {conflictError && <div className="error-badge" style={{ marginTop: '0.5rem' }}>{conflictError}</div>}
                    <p className="help-text">
                        Global hotkey to toggle the overlay bar.
                    </p>
                </div>

                <div className="form-group">
                    <label>Default Browser</label>
                    <CustomSelect
                        value={defaultBrowser}
                        onChange={setDefaultBrowser}
                        options={[
                            { value: "Google Chrome", label: "Google Chrome" },
                            { value: "Safari", label: "Safari" },
                            { value: "Firefox", label: "Firefox" },
                            { value: "Microsoft Edge", label: "Microsoft Edge" },
                            { value: "Arc", label: "Arc" },
                            { value: "Brave Browser", label: "Brave Browser" },
                        ]}
                    />
                    <p className="help-text">
                        Used when checking for active tabs or opening links.
                    </p>
                </div>

            </div>
        </div>
    );
}

interface SelectOption {
    value: string;
    label: string;
}

function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: SelectOption[] }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on click outside (simple implementation using transparent overlay if needed, or document listener)
    // For simplicity, we'll use a document click listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && !(event.target as Element).closest('.custom-select-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="custom-select-container">
            <div
                className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedLabel}</span>
            </div>
            <div className={`custom-select-options ${isOpen ? 'is-open' : ''}`}>
                {options.map(option => (
                    <div
                        key={option.value}
                        className={`custom-option ${option.value === value ? 'selected' : ''}`}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                    >
                        {option.label}
                        {option.value === value && <span>✓</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
