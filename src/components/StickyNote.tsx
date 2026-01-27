import { useState, useEffect } from "react";
import "../styles/StickyNote.css";

export default function StickyNote() {
    const [content, setContent] = useState("");
    const [visible, setVisible] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const handleContent = (_event: any, payload: { content: string; duration: number }) => {
            setContent(payload.content);
            setVisible(true);
            setFadeOut(false);

            // Auto-hide after duration
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setVisible(false);
                    setContent("");
                }, 300); // Wait for fade animation
            }, payload.duration);
        };

        window.ipcRenderer?.on("sticky-note-content", handleContent);

        return () => {
            window.ipcRenderer?.removeAllListeners("sticky-note-content");
        };
    }, []);

    const handleClose = () => {
        setFadeOut(true);
        setTimeout(() => {
            setVisible(false);
            setContent("");
        }, 300);
    };

    if (!visible) return null;

    return (
        <div className={`sticky-note-container ${fadeOut ? "fade-out" : ""}`}>
            <button className="sticky-note-close" onClick={handleClose}>
                ✕
            </button>
            <div className="sticky-note-content">
                {content}
            </div>
        </div>
    );
}
