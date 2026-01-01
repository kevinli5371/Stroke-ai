import { useState, useEffect } from 'react';
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
                    if (prefs.overlayHotkey) {
                        setOverlayHotkey(prefs.overlayHotkey);
                    }
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

    const savePreferences = async (newPrefs: { apiKey: string, defaultBrowser: string, theme: string, overlayHotkey?: { mods: string[], key: string } }) => {
        try {
            await window.electron.savePreferences({
                apiKey: newPrefs.apiKey,
                defaultBrowser: newPrefs.defaultBrowser,
                theme: newPrefs.theme as "light" | "dark",
                overlayHotkey: newPrefs.overlayHotkey
            });
        } catch (e) {
            console.error("Failed to auto-save settings", e);
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
            savePreferences({ apiKey, defaultBrowser, theme, overlayHotkey });
        }, 800);
        return () => clearTimeout(timer);
    }, [apiKey]);

    // Autosave others (Immediate, if valid)
    useEffect(() => {
        if (!initialLoad) return;
        if (!conflictError) {
            savePreferences({ apiKey, defaultBrowser, theme, overlayHotkey });
        }
    }, [defaultBrowser, theme, overlayHotkey]);

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
                            onChange={e => setOverlayHotkey({ ...overlayHotkey, key: e.target.value.toUpperCase().slice(0, 1) })}
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
