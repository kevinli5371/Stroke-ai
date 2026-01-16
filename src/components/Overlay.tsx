import { useState, useEffect } from "react";
import "../styles/Overlay.css";
/* import "../styles/App.css";  <-- If we decide to keep shared styles there, or we can merge them. */

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
        // Prevent scrolling globally
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        const handleTrigger = (_event: any, payload: any) => {
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
        };

        const handleComplete = () => {
            // Keep it visible for at least a split second so it doesn't flash too fast if the task is instant?
            // User requested a 0.5s buffer.
            setTimeout(() => {
                setActive(false);
                setDisplayText("");
            }, 500);
        };

        window.ipcRenderer?.on("trigger", handleTrigger);
        window.ipcRenderer?.on("workflow-completed", handleComplete);

        return () => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
            window.ipcRenderer?.removeAllListeners("trigger");
            window.ipcRenderer?.removeAllListeners("workflow-completed");
        };
    }, []);

    return (
        <div className="overlay-container">

            {/* Wrapper for the layered effect */}
            <div className="overlay-wrapper">

                {/* Layer 1: The Gooey Shapes (Backgrounds) */}
                <div className="layer-container goo-layer">
                    {/* Pill BG */}
                    <div
                        className="motion-element blob-bg shape-pill"
                        style={{
                            width: active ? "75px" : "27px",
                            transform: active ? "translateX(-30px)" : "translateX(0)"
                        }}
                    />
                    {/* Circle BG */}
                    <div
                        className="motion-element blob-bg shape-circle"
                        style={{
                            transform: active ? "translateX(30px)" : "translateX(0)",
                            opacity: active ? 1 : 0
                        }}
                    />
                </div>

                {/* Layer 2: The Content (Text/Spinner) */}
                <div className="layer-container content-layer">
                    {/* Pill Content */}
                    <div
                        className="motion-element blob-content shape-pill"
                        style={{
                            width: active ? "75px" : "27px",
                            transform: active ? "translateX(-30px)" : "translateX(0)"
                        }}
                    >
                        {active ? (
                            <span className="pill-text-active">
                                {displayText}
                            </span>
                        ) : (
                            <span className="pill-text-idle">⌘</span>
                        )}
                    </div>

                    {/* Circle Content */}
                    <div
                        className="motion-element blob-content shape-circle"
                        style={{
                            transform: active ? "translateX(30px)" : "translateX(0)",
                            opacity: active ? 1 : 0
                        }}
                    >
                        {active && <div className="spinner"></div>}
                    </div>
                </div>

            </div>

            {/* SVG Filter Definition (Hidden) */}
            <svg className="svg-filter-def" width="0" height="0">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
