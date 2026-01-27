import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Overlay from "./components/Overlay";
import StickyNote from "./components/StickyNote";

export default function App() {
  const [isOverlay, setIsOverlay] = useState(false);
  const [isStickyNote, setIsStickyNote] = useState(false);

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.has("overlay")) {
      setIsOverlay(true);
      document.body.style.background = "transparent"; // Ensure body is transparent for overlay
    } else if (params.has("stickynote")) {
      setIsStickyNote(true);
      document.body.style.background = "transparent";
    }
  }, []);

  if (isStickyNote) return <StickyNote />;
  return isOverlay ? <Overlay /> : <Dashboard />;
}

