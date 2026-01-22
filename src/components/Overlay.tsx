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
    const [progress, setProgress] = useState(0); // 0 to 1

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
            setProgress(0.05); // Start with a tiny bit
        };

        const handleProgress = (_event: any, payload: { current: number, total: number }) => {
            if (payload.total > 0) {
                setProgress(payload.current / payload.total);
            }
        };

        const handleComplete = () => {
            setProgress(1);
            // Keep it visible for at least a split second so it doesn't flash too fast
            setTimeout(() => {
                setActive(false);
                setDisplayText("");
                setProgress(0);
            }, 500);
        };

        window.ipcRenderer?.on("trigger", handleTrigger);
        window.ipcRenderer?.on("workflow-progress", handleProgress);
        window.ipcRenderer?.on("workflow-completed", handleComplete);

        return () => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
            window.ipcRenderer?.removeAllListeners("trigger");
            window.ipcRenderer?.removeAllListeners("workflow-progress");
            window.ipcRenderer?.removeAllListeners("workflow-completed");
        };
    }, []);

    // Calculate perimeter for dasharray approximation
    // standard pill: 2 * (width + height) roughly, but clearer to just use a large enough number covers the loop
    // Active width 75, height 27 -> perimeter ~200
    const strokeDasharray = 200;
    // Calculate offset based on progress: 200 -> 0 used to be the animation
    // Now: Start at 200 (empty) -> End at 0 (full)
    const strokeDashoffset = strokeDasharray * (1 - progress);

    return (
        <div className="overlay-container">
            <div className="overlay-wrapper">

                {/* 1. Content Layer */}
                <div
                    className="blob-content"
                    style={{
                        width: active ? "64px" : "38px",
                        height: active ? "22px" : "8px",
                    }}
                >
                    {active && (
                        <span className="pill-text-active">
                            {displayText}
                        </span>
                    )}
                </div>

                {/* 2. SVG Border Layer */}
                <svg className="overlay-svg">
                    <rect
                        x={100 - (active ? 32 : 19)}
                        y={30 - (active ? 11 : 4)}
                        width={active ? "64px" : "38px"}
                        height={active ? "22px" : "8px"}
                        rx={active ? 11 : 4}
                        className="border-base transition-rect"
                    />

                    <rect
                        x={100 - (active ? 32 : 19)}
                        y={30 - (active ? 11 : 4)}
                        width={active ? "64px" : "38px"}
                        height={active ? "22px" : "8px"}
                        rx={active ? 11 : 4}
                        className={`border-active ${active ? 'visible' : ''} transition-rect`}
                        strokeDasharray={strokeDasharray}
                        style={{ strokeDashoffset }}
                    />
                </svg>

            </div>
        </div>
    );
}
