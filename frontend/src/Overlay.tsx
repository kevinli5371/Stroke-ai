import { useState, useEffect } from "react";
import "./App.css"; // Reuse or create Overlay.css

const MOD_SYMBOLS: Record<string, string> = {
    cmd: "⌘",
    alt: "⌥",
    shift: "⇧",
    ctrl: "⌃",
};

export default function Overlay() {
    const [active, setActive] = useState(false);
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        // Prevent scrolling globally for the overlay window
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Listen for trigger events from main process
        // @ts-ignore
        window.ipcRenderer?.on("trigger", (_event, payload) => {
            // payload can be a string (legacy) or object { message, hotkey }
            let textToShow = "";

            if (typeof payload === "string") {
                textToShow = payload;
            } else if (payload && typeof payload === "object") {
                if (payload.hotkey) {
                    const mods = (payload.hotkey.mods || []).map((m: string) => MOD_SYMBOLS[m] || m).join(" ");
                    textToShow = `${mods} ${payload.hotkey.key}`.trim();
                } else {
                    textToShow = payload.message || "Running...";
                }
            }

            setActive(true);
            setDisplayText(textToShow);
            setTimeout(() => {
                setActive(false);
                setDisplayText("");
            }, 2500);
        });

        return () => {
            // Cleanup if needed
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
            // @ts-ignore
            window.ipcRenderer?.removeAllListeners("trigger");
        };
    }, []);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
                background: "transparent",
                overflow: "hidden" // Prevent scrollbars
            }}
        >
            <div
                className={active ? "pill active" : "pill idle"}
                style={{
                    background: "rgba(20, 20, 20, 0.95)", // Almost opaque dark
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
                    // boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    width: active ? "120px" : "32px",
                    height: "32px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.1)"
                }}
            >
                {active ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 10px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 600 }}>
                            {displayText}
                        </span>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <span style={{ fontSize: "16px", fontWeight: 700 }}>⌘</span>
                )}
            </div>
        </div>
    );
}
