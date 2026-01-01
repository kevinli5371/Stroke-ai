import { useState, useEffect } from 'react';
import '../styles/Dashboard.css'; // Reuse existing styles for consistency

export default function Settings() {
    const [apiKey, setApiKey] = useState("");
    const [defaultBrowser, setDefaultBrowser] = useState("Google Chrome");
    const [initialLoad, setInitialLoad] = useState(false);
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        // Load initial settings
        async function load() {
            try {
                if (window.electron && window.electron.getPreferences) {
                    const prefs = await window.electron.getPreferences();
                    setApiKey(prefs.apiKey || "");
                    setDefaultBrowser(prefs.defaultBrowser || "Google Chrome");
                    setTheme(prefs.theme || "dark");
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setInitialLoad(true); // Ensure we mark load as complete
            }
        }
        load();
    }, []);

    const savePreferences = async (newPrefs: { apiKey: string, defaultBrowser: string, theme: string }) => {
        try {
            await window.electron.savePreferences({
                apiKey: newPrefs.apiKey,
                defaultBrowser: newPrefs.defaultBrowser,
                theme: newPrefs.theme as "light" | "dark"
            });
        } catch (e) {
            console.error("Failed to auto-save settings", e);
        }
    };

    // Autosave API Key (Debounced)
    useEffect(() => {
        if (!initialLoad) return;
        const timer = setTimeout(() => {
            savePreferences({ apiKey, defaultBrowser, theme });
        }, 800);
        return () => clearTimeout(timer);
    }, [apiKey]);

    // Autosave others (Immediate)
    useEffect(() => {
        if (!initialLoad) return;
        savePreferences({ apiKey, defaultBrowser, theme });
    }, [defaultBrowser, theme]);

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
