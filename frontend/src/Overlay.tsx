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
        // Prevent scrolling globally
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Listen for trigger events
        // @ts-ignore
        window.ipcRenderer?.on("trigger", (_event, payload) => {
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
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
            // @ts-ignore
            window.ipcRenderer?.removeAllListeners("trigger");
        };
    }, []);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            background: "transparent",
            overflow: "hidden"
        }}>

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
                            <span style={{ fontSize: "13px", fontWeight: 600, padding: "0 2px", whiteSpace: "nowrap" }}>
                                {displayText}
                            </span>
                        ) : (
                            <span style={{ fontSize: "14px", fontWeight: 700 }}>⌘</span>
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
            <svg style={{ visibility: "hidden", position: "absolute" }} width="0" height="0">
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
