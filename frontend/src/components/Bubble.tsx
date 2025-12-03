import { useEffect, useState, useRef } from "react";
import "../styles/bubble.css";

function Bubble() {
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // resize overlay to fit pill, optional
  useEffect(() => {
    if (!ref.current) return;
    const width = ref.current.offsetWidth;
    (window as any).electronAPI?.resizeOverlay?.(width + 16);
  }, [isLoading]);

  // listen for overlay-loading events from main
  useEffect(() => {
    const ipc = (window as any).ipcRenderer;
    if (!ipc) return;

    const handler = (_event: any, value: boolean) => {
      setIsLoading(value);
    };

    ipc.on("overlay-loading", handler);

    return () => {
      ipc.removeListener?.("overlay-loading", handler);
    };
  }, []);

  return (
    <div className="bubble-container">
      <div
        className={`bubble ${isLoading ? "bubble-loading" : ""}`}
        ref={ref}
      >
        <div className="dots">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}

export default Bubble;
