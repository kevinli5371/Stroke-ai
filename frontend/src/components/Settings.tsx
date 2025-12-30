import { useState, useEffect } from 'react';
import '../styles/Dashboard.css'; // Reuse existing styles for consistency

interface SettingsProps {
    onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
    const [apiKey, setApiKey] = useState("");
    const [defaultBrowser, setDefaultBrowser] = useState("Google Chrome");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        // Load initial settings
        async function load() {
            setLoading(true);
            try {
                if (window.electron && window.electron.getPreferences) {
                    const prefs = await window.electron.getPreferences();
                    setApiKey(prefs.apiKey || "");
                    setDefaultBrowser(prefs.defaultBrowser || "Google Chrome");
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleSave() {
        setLoading(true);
        setMessage(null);
        try {
            await window.electron.savePreferences({
                apiKey,
                defaultBrowser
            });
            setMessage("Settings saved successfully.");
            // Hide message after 2 seconds
            setTimeout(() => setMessage(null), 2000);
        } catch (e) {
            console.error(e);
            setMessage("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="settings-container">
            <header className="settings-header">
                <button onClick={onBack} className="back-btn">← Back</button>
                <h2>Settings</h2>
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
                    <label>Default Browser</label>
                    <select
                        value={defaultBrowser}
                        onChange={(e) => setDefaultBrowser(e.target.value)}
                    >
                        <option value="Google Chrome">Google Chrome</option>
                        <option value="Safari">Safari</option>
                        <option value="Firefox">Firefox</option>
                        <option value="Microsoft Edge">Microsoft Edge</option>
                        <option value="Arc">Arc</option>
                        <option value="Brave Browser">Brave Browser</option>
                    </select>
                    <p className="help-text">
                        Used when checking for active tabs or opening links.
                    </p>
                </div>

                <div className="form-actions">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="save-btn"
                    >
                        {loading ? "Saving..." : "Save Settings"}
                    </button>
                </div>

                {message && <div className={`status-message ${message.includes("Failed") ? "error" : "success"}`}>
                    {message}
                </div>}
            </div>
        </div>
    );
}
