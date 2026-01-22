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
                        width: active ? "75px" : "50px",
                        height: active ? "27px" : "12px",
                        // transform not needed if we just animate width/height directly, 
                        // center alignment handled by flex in container
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
                    {/* Width/Height must match the container/pill animation ideally, 
                        but effectively we center the rects.
                        Actually simpler: make the SVG match the content size? 
                        Or just use centered rects.
                        Let's render rects that match the current dimensions. 
                    */}

                    <rect
                        x={100 - (active ? 37.5 : 25)}
                        y={30 - (active ? 13.5 : 6)}
                        width={active ? "75px" : "50px"}
                        height={active ? "27px" : "12px"}
                        rx={active ? 13.5 : 6}
                        className="border-base transition-rect"
                    />

                    <rect
                        x={100 - (active ? 37.5 : 25)}
                        y={30 - (active ? 13.5 : 6)}
                        width={active ? "75px" : "50px"}
                        height={active ? "27px" : "12px"}
                        rx={active ? 13.5 : 6}
                        className={`border-active ${active ? 'visible' : ''} transition-rect`}
                        strokeDasharray={strokeDasharray}
                        style={{ strokeDashoffset }}
                    />
                </svg>

            </div>
        </div>
    );
}
